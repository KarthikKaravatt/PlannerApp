import type { RootState } from "@/app/store";
import type { Task } from "@/schemas/taskList";
import type { FilterOption, SortOption } from "@/types/taskList";
import { createSelector } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { apiSlice } from "./apiSlice.ts";
const selectTasksResult = apiSlice.endpoints.getTasks.select();
const selectFilterOption = (
	_state: RootState,
	_sortOption: SortOption,
	filterOption: FilterOption,
) => filterOption;
const selectSortOption = (
	_state: RootState,
	sortOption: SortOption,
	_filterOption: FilterOption,
) => sortOption;
export const selectTasksFilterAndSort = createSelector(
	[selectTasksResult, selectFilterOption, selectSortOption],
	(tasks, filterOption, sortOption) => {
		if (!tasks.isLoading && tasks.data) {
			const data = tasks.data;
			const sortByCustomOrder = (a: Task, b: Task) => {
				const aIndex = a.orderIndex;
				const bIndex = b.orderIndex;

				if (aIndex === -1 && bIndex === -1) {
					return 0;
				}
				if (aIndex === -1) {
					return 1;
				}
				if (bIndex === -1) {
					return -1;
				}

				return aIndex - bIndex;
			};

			const sortByDate = (a: Task, b: Task) => {
				if (a.kind === "withDate" && b.kind === "withDate") {
					const aDate = DateTime.fromISO(a.dueDate);
					const bDate = DateTime.fromISO(b.dueDate);
					return aDate.toMillis() - bDate.toMillis();
				}
				if (a.kind === "withoutDate" || b.kind === "withDate") {
					return 1;
				}
				return -1;
			};

			const sortByName = (a: Task, b: Task) => {
				return a.label.localeCompare(b.label);
			};
			const filteredList = Array.from(data)
				.filter((task) => {
					// biome-ignore lint/style/useDefaultSwitchClause: Using an enum
					switch (filterOption) {
						case "COMPLETE":
							return task.completed;
						case "INCOMPLETE":
							return !task.completed;
						case "ALL":
							return true;
					}
				})
				.sort((a, b) => {
					// biome-ignore lint/style/useDefaultSwitchClause: Using an enum
					switch (sortOption) {
						case "CUSTOM": {
							return sortByCustomOrder(a, b);
						}
						case "DATE": {
							return sortByDate(a, b);
						}
						case "NAME":
							return sortByName(a, b);
					}
				});
			return filteredList;
		}
	},
);
