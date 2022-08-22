#!/bin/bash

set -e

# if [[ "$0" = "${BASH_SOURCE[0]}" ]]; then
#     echo "the script must be runned by source. exit";
#     exit 1;
# fi

if ! [ -d ./dist ]; then
    echo "dist folder not found! Please build branch-listener.";
    return 1
fi

bash ./branch-listener kill

MAIN_DIR="$HOME/.config/branch-listener"

if [ "$(echo "$SHELL" | grep '/zsh')" ]; then
    BRANCH_LISTENER_SHELL_RC="$HOME/.zshrc"
elif [ "$(echo "$SHELL" | grep '/bash')" ]; then
    BRANCH_LISTENER_SHELL_RC="$HOME/.bashrc"
else 
    echo "unsupportable shell! exit"
    return 1
fi

if ! [ "$(cat $BRANCH_LISTENER_SHELL_RC | grep BRANCH_LISTENER_SHELL_RC=)" ]; then
    echo 'export BRANCH_LISTENER_SHELL_RC='"$BRANCH_LISTENER_SHELL_RC" | tee -a "$BRANCH_LISTENER_SHELL_RC"
fi

if ! [ "$(echo "$PATH" | grep "$MAIN_DIR")" ]; then
    export PATH="$PATH":"$MAIN_DIR"
fi

if ! [ "$(cat $BRANCH_LISTENER_SHELL_RC | grep $MAIN_DIR)" ]; then
    echo 'export PATH=$PATH:'"$MAIN_DIR" | tee -a "$BRANCH_LISTENER_SHELL_RC"
fi

if [ -z "$BRANCH_LISTENER_MAIN_DIR" ]; then
    export BRANCH_LISTENER_MAIN_DIR="$MAIN_DIR"
fi

if ! [ "$(cat  $BRANCH_LISTENER_SHELL_RC | grep 'BRANCH_LISTENER_MAIN_DIR='$BRANCH_LISTENER_MAIN_DIR)" ]; then
    echo "export BRANCH_LISTENER_MAIN_DIR=$MAIN_DIR" | tee -a "$BRANCH_LISTENER_SHELL_RC"
fi

if [ -d "$MAIN_DIR" ]; then
    rm -rf "$MAIN_DIR"
fi

mkdir -p "$MAIN_DIR/dist"
cp -r ./dist/* "$MAIN_DIR/dist"
cp -r  ./configs "$MAIN_DIR"
cp -r ./node_modules "$MAIN_DIR"
cp -r ./assets "$MAIN_DIR"
cp ./branch-listener "$MAIN_DIR"
mkdir "$MAIN_DIR/logs"
touch "$MAIN_DIR/logs/output.log"

if ! [ "$(cat  $BRANCH_LISTENER_SHELL_RC | grep 'branch-listener start')" ]; then
    echo 'if [ $TERM = "linux" ]; then branch-listener start; fi' | tee -a "$BRANCH_LISTENER_SHELL_RC"
fi

LOG_FOLDER="$MAIN_DIR/logs"
LOG_FILE=output.log

if ! [ -f "$LOG_FOLDER/$LOG_FILE" ]; then
    mkdir "$LOG_FOLDER";
    touch "$LOG_FOLDER/$LOG_FILE";
fi

branch-listener start

echo "autorun of branch-listener configured successfully.";
exit 0
