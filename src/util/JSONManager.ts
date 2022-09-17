import fs from "fs";
import { isArrayHasAnyEmptyObject, signalManager } from "./extra";

export default class JSONManager {
    
    public path!: string;
    private contents!: object[];
    private content_backup!: object[];
    private base_template = {
        all: [
            {

            }
        ]
    };
    private watcher!: fs.FSWatcher;
    private saved_by_self: boolean = false;

    constructor (path: string) {
        this.path = path;
    }

    public async init() {
        await this.overrideIfNotValidFile();

        const file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
        if (file) this.contents = JSON.parse(file)["all"];
        else this.contents = this.base_template["all"];
        // this.content_backup = JSON.parse(JSON.stringify(this.contents));

        //update file if it has been changed
        this.watcher = fs.watch(this.path, "utf8", (event: string) => {
            if (this.saved_by_self) return;
            if (event === "change") {
                const new_file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
                if (new_file) this.contents = JSON.parse(new_file)["all"];
            }
        });

        signalManager.addCallback(this.watcher.close.bind(this.watcher));
    }

    public get content() {
        return this.contents;
    }
    
    public set content(content) {
        this.contents = content;
    }

    private checkValidation() {
        if (!fs.existsSync(this.path)) return false;

        const file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
        if (!file) return false;

        return true;
    }

    private overrideIfNotValidFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            const isValid = this.checkValidation();

            if (!isValid) {
                fs.writeFile(this.path, JSON.stringify(this.base_template), err => {
                    if (err) reject(err);
                    resolve();
                });
            } else resolve();
        });
    }

    public async save(override: boolean) {
        if (this.base_template.all[0] && Object.keys(this.base_template.all[0]).length === 0) 
            this.base_template.all.shift();

        this.clearEmptyObjects();

        if (override) {
            await fs.promises.writeFile(this.path, "");
            this.base_template.all = [this.contents[0]];
        } else this.base_template.all = this.contents;
        this.saved_by_self = true;
        await fs.promises.writeFile(
            this.path, 
            JSON.stringify(this.base_template, null, '\t'), 
            {
                encoding: "utf-8",
                flag: "w"
            }
        );

        setTimeout(() => {
            this.saved_by_self = false;
        }, 2000)
        return Promise.resolve();
    }

    private clearEmptyObjects() {
        if (Array.isArray(this.contents)) {
            for (const obj of this.contents) {
                if (
                    typeof obj !== "object" ||
                    !Object.keys(obj).length 
                ) {
                    this.contents.slice(
                        this.contents.indexOf(obj),
                        1
                    );
                }
            }
        }
    }

    public async removeSpecifiedObject(id: number) {
        if (!this.contents[id])
            throw new Error("element is undefined");
        
        this.contents.splice(
            id,
            1
        );
        
        await this.save(false);
        
        return Promise.resolve();
    }

    public isEmpty() {
        return (
            !this.contents ||
            this.contents.length === 0 ||
            isArrayHasAnyEmptyObject(this.contents)
        );
    }

    public closeWatcher() {
        this.watcher.close();
    }
}
