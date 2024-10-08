<script lang="ts">
import { defineComponent } from 'vue';
import NodeIcon from '@/components/NodeIcon.vue';
import type { ITemplatesNode } from '@/Interface';
import { filterTemplateNodes } from '@/utils/nodeTypesUtils';

export default defineComponent({
	name: 'NodeList',
	components: {
		NodeIcon,
	},
	props: {
		nodes: {
			type: Array,
		},
		limit: {
			type: Number,
			default: 4,
		},
		size: {
			type: String,
			default: 'sm',
		},
	},
	computed: {
		filteredCoreNodes() {
			return filterTemplateNodes(this.nodes as ITemplatesNode[]);
		},
		hiddenNodes(): number {
			return this.filteredCoreNodes.length - this.countNodesToBeSliced(this.filteredCoreNodes);
		},
		slicedNodes(): ITemplatesNode[] {
			return this.filteredCoreNodes.slice(0, this.countNodesToBeSliced(this.filteredCoreNodes));
		},
	},
	methods: {
		countNodesToBeSliced(nodes: ITemplatesNode[]): number {
			if (nodes.length > this.limit) {
				return this.limit - 1;
			} else {
				return this.limit;
			}
		},
	},
});
</script>

<template>
	<div :class="$style.list">
		<div v-for="node in slicedNodes" :key="node.name" :class="[$style.container, $style[size]]">
			<NodeIcon :node-type="node" :size="size === 'md' ? 24 : 18" :show-tooltip="true" />
		</div>
		<div
			v-if="filteredCoreNodes.length > limit + 1"
			:class="[$style.button, size === 'md' ? $style.buttonMd : $style.buttonSm]"
		>
			+{{ hiddenNodes }}
		</div>
	</div>
</template>

<style lang="scss" module>
.list {
	max-width: 100px;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
}
.container {
	position: relative;
	display: block;
}
.sm {
	margin-left: var(--spacing-2xs);
}
.md {
	margin-left: var(--spacing-xs);
}
.button {
	top: 0px;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--color-background-light);
	border: 1px var(--color-foreground-base) solid;
	border-radius: var(--border-radius-base);
	font-size: 10px;
	font-weight: var(--font-weight-bold);
	color: var(--color-text-base);
}
.buttonSm {
	margin-left: var(--spacing-2xs);
	width: 20px;
	min-width: 20px;
	height: 20px;
}
.buttonMd {
	margin-left: var(--spacing-xs);
	width: 24px;
	min-width: 24px;
	height: 24px;
}
</style>
