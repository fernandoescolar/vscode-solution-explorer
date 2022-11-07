import * as vscode from 'vscode';

export class TaskManager {
    private tasks: { [id: string]: vscode.Task[]; };
    private isTaskRunning: { [id: string]: Boolean; };
    private executeCallback: Function;
    private notify: Function;

    constructor(executeCallback: Function, notify: Function) {
        this.tasks = {};
        this.isTaskRunning = {};
        this.executeCallback = executeCallback;
        this.notify = notify;
    }

    addTask(task: vscode.Task) {
        if (this.tasks[task.name] === undefined || this.tasks[task.name].length === 0) {
            this.tasks[task.name] = [];
            if (this.isTaskRunning[task.name] === true) {
                this.tasks[task.name].push(task);
            } else {
                this.execute(task);
            }
        }
        else {
            this.tasks[task.name].push(task);
        }
    }

    handleDidEndTask(e: vscode.TaskEndEvent) {
        let taskName = e.execution.task.name;
        this.isTaskRunning[taskName] = false;
        this.sendNotification(taskName, this.tasks[taskName] !== undefined ? this.tasks[taskName].length : 0);
        if (this.tasks[taskName] !== undefined) {
            let task = this.tasks[taskName].shift();
            if (task !== undefined) {
                this.execute(task);
            }

        }
    }

    private sendNotification(taskName: string, remainingTaska: Number) {
        this.notify({ "name": taskName, "remaining": remainingTaska });
    }

    private execute(task: vscode.Task) {
        this.isTaskRunning[task.name] = true;
        this.executeCallback(task);
    }
}