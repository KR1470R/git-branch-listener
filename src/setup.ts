import readline from "readline";
import { stdin, stdout } from 'process';
import ConfigFactory from "./util/ConfigFactory";

const input = readline.createInterface(stdin, stdout);

const default_config_server = new ConfigFactory("server", true);
const config_server = new ConfigFactory("server", false);

const git_config = new ConfigFactory("git");
const bitbucket_config = new ConfigFactory("bitbucket");

const server_quiz = (resolve: Function) => {
    return new Promise(() => {
        input.question(`Enter port(default ${default_config_server.getProperty("port")}): `, (answ: any) => {
            if (answ) {
                if (!(/^\d+$/.test(answ))) 
                    throw new Error("Port must contain only digits! Try again.");
                config_server.setProperty("port", answ);
            } else config_server.setProperty("port", default_config_server.getProperty("port"));

            input.question(`Enter timer interval(default ${default_config_server.getProperty("timer_interval")}ms): `, (answ: any) => {
                if (answ) {
                    if (!(/^\d+$/.test(answ))) 
                        throw new Error("Timer must contain only digits! Try again.");
                    config_server.setProperty("timer_interval", Number(answ));
                } else
                    config_server
                        .setProperty("timer_interval", default_config_server.getProperty("timer_interval"));
                input.question(
                    `Enter minutes difference between commit publish(default ${default_config_server.getProperty("minutes_difference")}): `,
                    (answ: any) => {
                        if (answ) {
                            if (!(/^\d+$/.test(answ))) 
                                throw new Error("Minutes difference must contain only digits! Try again.");
                            
                            config_server.setProperty("minutes_difference", Number(answ));
                        } else
                            config_server
                                .setProperty(
                                    "minutes_difference", 
                                    default_config_server.getProperty("minutes_difference")
                                );

                        resolve(1);
                    }
                );
            }); 
        });
    })
}

const quiz_git = (resolve: Function) => {
    return new Promise(() => {
        config_server.setProperty("cvs", "git");

        input.question("Enter username: ", (answ: any) => {
            if (!answ) throw new Error("Username is nessessary!");
            git_config.setProperty("username", answ);

            input.question("Enter repository name: ", (answ: any) => {
                if (!answ) throw new Error("Repository name is necessary!");
                git_config.setProperty("repo", answ);

                input.question(`Enter branch name: `, (answ: any) => {
                    if (!answ) throw new Error("Branch name is necessary!"); 
                    git_config.setProperty("branch", answ);

                    server_quiz(resolve);
                });
            });
        });
    });
}

const quiz_bibucket = (resolve: Function) => {
    return new Promise(() => {
        config_server.setProperty("cvs", "bitbucket");
        input.question("Enter username: ", (answ: any) => {
            if (!answ) throw new Error("Username is nessessary!");
            bitbucket_config.setProperty("username", answ);

            input.question("Enter app password: ", (answ: any) => {
                if (!answ) throw new Error("App password is nessessary!");
                bitbucket_config.setProperty("app_password", answ);

                input.question("Enter workspace name: ", (answ: any) => {
                    if (!answ) throw new Error("Workspace name is necessary!");
                    bitbucket_config.setProperty("workspace", answ);
        
                    input.question("Enter repository slug: ", (answ: any) => {
                        if (!answ) throw new Error("Repository slug is necessary!");
                        bitbucket_config.setProperty("repo_slug", answ);
        
                        input.question(`Enter branch name: `, (answ: any) => {
                            if (!answ) throw new Error("Branch name is necessary!"); 
                            bitbucket_config.setProperty("branch", answ);
        
                            server_quiz(resolve);
                        });
                    });
                });
            });
        });
    });
}

const narroving = () => {
    return new Promise(resolve => {
        input.question("Choose Control Version System(git/bitbucket): ", (answ: any) => {
            if (answ) {
                if (String(answ).toLowerCase() === "git") return quiz_git(resolve);
                else if (String(answ).toLowerCase() === "bitbucket") return quiz_bibucket(resolve);
                else throw new Error("Uknown control version system. Try again.");
            } else throw new Error("Unrecognizable input data. Try again.")
        });
    });
}

const saveAll = () => {
    config_server.saveAll();
    git_config.saveAll();
    bitbucket_config.saveAll();
}

narroving()
    .then(res => {
        saveAll();
        console.log("branch-listener setup has been finished successfully.");
        input.close();
    });