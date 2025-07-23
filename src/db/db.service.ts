import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import dataSource from '../config/typeorm.config';

@Injectable()
export class DbService {
    constructor(
        @InjectDataSource(dataSource)
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Creates and returns a connected query runner with a started transaction.
     * @returns An object containing the query runner and its transactional manager.
     */
    async startTransactionWithQueryRunner(): Promise<{
        queryRunner: QueryRunner;
        manager: EntityManager;
    }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        return {
            queryRunner,
            manager: queryRunner.manager,
        };
    }

    /**
     * Commits the transaction and releases the query runner.
     */
    async commitAndRelease(queryRunner: QueryRunner) {
        try {
            await queryRunner.commitTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Rolls back the transaction and releases the query runner.
     */
    async rollbackAndRelease(queryRunner: QueryRunner) {
        try {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Creates a new QueryRunner instance.
     */
    createQueryRunner(): QueryRunner {
        return this.dataSource.createQueryRunner();
    }

    /**
     * Connects the QueryRunner to the database.
     */
    async connect(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.connect();
    }

    /**
     * Starts a new transaction on the QueryRunner.
     */
    async startTransaction(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();
    }
}
