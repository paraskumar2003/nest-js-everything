import {
    Repository,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    DeepPartial,
    QueryRunner,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export class BaseService<T extends BaseEntity> {
    constructor(protected readonly repository: Repository<T>) {}

    async find(
        options?: Omit<FindManyOptions<T>, 'where'> & {
            where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
        },
    ): Promise<T[]> {
        const mergedWhere = this.mergeWithActive(options?.where);
        return this.repository.find({ ...options, where: mergedWhere });
    }

    async findOne(
        options?: Omit<FindOneOptions<T>, 'where'> & {
            where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
        },
        q?: QueryRunner,
    ): Promise<T | null> {
        const mergedWhere = this.mergeWithActive(options?.where);
        const findOptions = { ...options, where: mergedWhere };

        if (q) {
            return q.manager.findOne<T>(
                this.repository.target as any,
                findOptions,
            );
        }

        return this.repository.findOne(findOptions);
    }

    async findAll(
        options?: Omit<FindManyOptions<T>, 'where'> & {
            where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
        },
    ): Promise<T[] | null> {
        const mergedWhere = this.mergeWithActive(options?.where);
        return this.repository.find({ ...options, where: mergedWhere });
    }

    async findOneBy(conditions: Partial<T>): Promise<T | null> {
        const where = { ...conditions, active: true } as FindOptionsWhere<T>;
        return this.repository.findOneBy(where);
    }

    async findOneById(id: number | string): Promise<T | null> {
        return this.findOneBy({ id } as Partial<T>);
    }

    // Create entity instance WITHOUT saving to DB
    createInstance(data: DeepPartial<T>, q?: QueryRunner): T {
        if (q) {
            return q.manager.create<T, DeepPartial<T>>(
                this.repository.target as any,
                data,
            );
        }
        return this.repository.create(data);
    }

    async saveInstance(entity: T, q?: QueryRunner): Promise<T> {
        if (q) {
            return q.manager.save<T, DeepPartial<T>>(
                this.repository.target as any,
                entity,
            );
        }
        return await this.repository.save(entity);
    }

    private mergeWithActive(
        where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
        if (!where) {
            return { active: true } as unknown as FindOptionsWhere<T>;
        }

        if (Array.isArray(where)) {
            return where.map(w => ({ ...w, active: true }));
        }

        return { ...where, active: true };
    }

    /**
     * Returns the repository instance.
     */
    getRepository() {
        return this.repository;
    }

    createQueryBuilder(alias: string) {
        return this.repository
            .createQueryBuilder(alias)
            .where(`${alias}.active = :active`, { active: true });
    }
}
