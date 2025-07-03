import * as cluster from 'cluster';
import type { Worker } from 'cluster';

import * as os from 'os';
import { Injectable } from '@nestjs/common';

const numCPUs = os.cpus().length;

@Injectable()
export class AppClusterService {
    static clusterize(callback: Function): void {
        const clusterTyped = cluster as any; // Ignore type checking

        if (clusterTyped.isPrimary) {
            console.log(`Master server started on ${process.pid}`);
            for (let i = 0; i < numCPUs; i++) {
                clusterTyped.fork();
            }

            clusterTyped.on(
                'exit',
                (worker: Worker, code: number, signal: string) => {
                    console.log(
                        `Worker ${worker.process.pid} died. Restarting`,
                    );
                    clusterTyped.fork();
                },
            );
        } else {
            console.log(`Cluster server started on ${process.pid}`);
            callback();
        }
    }
}
