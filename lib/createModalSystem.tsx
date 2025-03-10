import React, { memo } from 'react';
import { signal } from "@sgty/sigma";
import type { ComponentProps } from "react";
import { v4 } from 'uuid';

type ModalEntry = {
	id: string;
	Comp: (props: any) => any,
	props: any,
};

function last<T>(arr: T[]) {
	const lastIndex = arr.length - 1;
	return arr[lastIndex];
}

export function createModalSystem() {
	const modals$ = signal<ModalEntry[]>([]);

	const Renderer = memo(() => {
		const modal = modals$.use(modals => last(modals));
		if (!modal) return null;

		const { Comp, props, id } = modal;

		return <Comp {...props} key={id} />
	});

	const manager = {
		// wrap<T extends (props: any) => any>(Comp: T) {
		// 	const NewComp = (props: ComponentProps<T>) => {
		// 		return <Comp {...props} />
		// 	}

		// 	const extension = {
		// 		open(props: ComponentProps<T>) {
		// 			return manager.open(Comp, props);
		// 		}
		// 	}

		// 	return Object.assign(NewComp, extension) as T & typeof extension;
		// },

		open<T extends (props: any) => any, TProps extends ComponentProps<T>>(Comp: T, props: TProps) {
			const entry = { Comp, props, id: v4() };
			modals$.value = [...modals$.value, entry]

			const handle = {
				close() {
					manager.close(entry.id)
				},
				update(props: ComponentProps<T>) {
					manager.update(entry.id, props);
				}
			}

			return handle;
		},

		update(id: string, props: any) {
			modals$.value = modals$.value.map(e => {
				if (e.id === id) return {
					...e,
					props,
				}

				return e;
			});
		},

		close(id: string) {
			modals$.value = modals$.value.filter(e => e.id !== id);
		},

		closeAll() {
			modals$.set([]);
		},

		renderer: Renderer,
	}

	return manager;
}

export const modals = createModalSystem();