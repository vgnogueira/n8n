import { Column, Entity, ManyToOne, PrimaryColumn } from '@n8n/typeorm';
import { WorkflowEntity } from './workflow-entity';
import { WithTimestamps } from './abstract-entity';
import { Project } from './project';

export type WorkflowSharingRole = 'workflow:owner' | 'workflow:editor';

@Entity()
export class SharedWorkflow extends WithTimestamps {
	@Column()
	role: WorkflowSharingRole;

	@ManyToOne('WorkflowEntity', 'shared')
	workflow: WorkflowEntity;

	@PrimaryColumn()
	workflowId: string;

	@ManyToOne('Project', 'sharedWorkflows')
	project: Project;

	@PrimaryColumn()
	projectId: string;
}
