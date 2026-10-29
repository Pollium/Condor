import BaseModel from '../lib/models/BaseModel';
import { Fk } from '../lib/models/Fk';
import { Column, Entity, getMetadataArgsStorage } from 'typeorm';
import { describe, expect, it } from 'vitest';

@Entity()
class User extends BaseModel{
    @Column('varchar')
    name!: string;
}

@Entity()
class Note extends BaseModel{
    @Fk('User')
    userId!: string;

    @Fk('Workspace', { onDelete: 'CASCADE', nullable: true })
    workspaceId!: string | null;

    @Fk('User', { name: 'uploadedBy' })
    uploadedBy!: string;

    @Fk('Organization', { onDelete: 'CASCADE' })
    orgId!: string;
}

describe('Fk', () => {
    const relations = getMetadataArgsStorage().relations.filter((entry) => entry.target === Note);
    const joins = getMetadataArgsStorage().joinColumns.filter((entry) => entry.target === Note);
    const columns = getMetadataArgsStorage().columns.filter((entry) => entry.target === Note);

    it('registers a required uuid column and a many-to-one named after the column stem', () => {
        expect(columns.some((entry) => entry.propertyName === 'userId' && entry.options.type === 'uuid')).toBe(true);
        expect(relations).toContainEqual(expect.objectContaining({
            propertyName: 'user',
            relationType: 'many-to-one',
            type: 'User',
            options: expect.objectContaining({ nullable: false })
        }));
        expect(joins).toContainEqual(expect.objectContaining({
            propertyName: 'user',
            name: 'userId',
            referencedColumnName: 'id'
        }));
    });

    it('keeps onDelete and a nullable column', () => {
        expect(relations).toContainEqual(expect.objectContaining({
            propertyName: 'workspace',
            type: 'Workspace',
            options: expect.objectContaining({ onDelete: 'CASCADE', nullable: true })
        }));
        const workspace = columns.find((entry) => entry.propertyName === 'workspaceId');
        expect(workspace?.options.nullable).toBe(true);
    });

    it('names the relation after the column stem', () => {
        expect(relations).toContainEqual(expect.objectContaining({
            propertyName: 'org',
            type: 'Organization'
        }));
        expect(joins).toContainEqual(expect.objectContaining({
            propertyName: 'org',
            name: 'orgId'
        }));
    });

    it('joins on an explicit column name', () => {
        expect(joins).toContainEqual(expect.objectContaining({
            propertyName: '_uploadedBy',
            name: 'uploadedBy'
        }));
        void User;
    });
});
