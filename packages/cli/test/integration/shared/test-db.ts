import { Container } from 'typedi';
import type { DataSourceOptions, Repository } from '@n8n/typeorm';
import { DataSource as Connection } from '@n8n/typeorm';
import { GlobalConfig } from '@n8n/config';
import type { Class } from 'n8n-core';
import { randomString } from 'n8n-workflow';

import * as Db from '@/db';
import { getOptionOverrides } from '@/databases/config';
import { kebabCase } from 'lodash';

export const testDbPrefix = 'n8n_test_';

/**
 * Initialize one test DB per suite run, with bootstrap connection if needed.
 */
export async function init() {
	const globalConfig = Container.get(GlobalConfig);
	const dbType = globalConfig.database.type;
	const testDbName = `${testDbPrefix}${randomString(6, 10).toLowerCase()}_${Date.now()}`;

	if (dbType === 'postgresdb') {
		const bootstrapPostgres = await new Connection(
			getBootstrapDBOptions('postgresdb'),
		).initialize();
		await bootstrapPostgres.query(`CREATE DATABASE ${testDbName}`);
		await bootstrapPostgres.destroy();

		globalConfig.database.postgresdb.database = testDbName;
	} else if (dbType === 'mysqldb' || dbType === 'mariadb') {
		const bootstrapMysql = await new Connection(getBootstrapDBOptions('mysqldb')).initialize();
		await bootstrapMysql.query(`CREATE DATABASE ${testDbName} DEFAULT CHARACTER SET utf8mb4`);
		await bootstrapMysql.destroy();

		globalConfig.database.mysqldb.database = testDbName;
	}

	await Db.init();
	await Db.migrate();
}

/**
 * Drop test DB, closing bootstrap connection if existing.
 */
export async function terminate() {
	await Db.close();
}

// Can't use `Object.keys(entities)` here because some entities have a `Entity` suffix, while the repositories don't
const repositories = [
	'AnnotationTag',
	'AuthIdentity',
	'AuthProviderSyncHistory',
	'Credentials',
	'EventDestinations',
	'Execution',
	'ExecutionAnnotation',
	'ExecutionData',
	'ExecutionMetadata',
	'InstalledNodes',
	'InstalledPackages',
	'Project',
	'ProjectRelation',
	'Role',
	'Project',
	'ProjectRelation',
	'Settings',
	'SharedCredentials',
	'SharedWorkflow',
	'Tag',
	'User',
	'Variables',
	'Webhook',
	'Workflow',
	'WorkflowHistory',
	'WorkflowStatistics',
	'WorkflowTagMapping',
] as const;

/**
 * Truncate specific DB tables in a test DB.
 */
export async function truncate(names: Array<(typeof repositories)[number]>) {
	for (const name of names) {
		const RepositoryClass: Class<Repository<object>> =
			// eslint-disable-next-line n8n-local-rules/no-dynamic-import-template
			(await import(`@/databases/repositories/${kebabCase(name)}.repository`))[`${name}Repository`];
		await Container.get(RepositoryClass).delete({});
	}
}

/**
 * Generate options for a bootstrap DB connection, to create and drop test databases.
 */
export const getBootstrapDBOptions = (dbType: 'postgresdb' | 'mysqldb'): DataSourceOptions => {
	const globalConfig = Container.get(GlobalConfig);
	const type = dbType === 'postgresdb' ? 'postgres' : 'mysql';
	return {
		type,
		...getOptionOverrides(dbType),
		database: type,
		entityPrefix: globalConfig.database.tablePrefix,
		schema: dbType === 'postgresdb' ? globalConfig.database.postgresdb.schema : undefined,
	};
};
