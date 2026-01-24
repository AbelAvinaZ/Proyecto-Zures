import { useQuery } from "@tanstack/react-query";
import boardHooks from "./useBoard";

const useBoardTags = (boardId, columnKey) => {
    const { useBoard } = boardHooks;
    const { data: board } = useBoard(boardId);

    return useQuery({
        queryKey: ["boardTags", boardId, columnKey],
        queryFn: () => {
            if (!board || !columnKey) return [];

            const tagsSet = new Set();

            board.items.forEach((item) => {
                const values = item.values;
                const cellValue =
                    values instanceof Map
                        ? values.get(columnKey.toString())
                        : values?.[columnKey.toString()];

                if (Array.isArray(cellValue)) {
                    cellValue.forEach((tag) => {
                        if (tag?.name) {
                            tagsSet.add(
                                JSON.stringify({
                                    name: tag.name,
                                    color: tag.color,
                                }),
                            );
                        }
                    });
                }
            });

            return Array.from(tagsSet).map((str) => JSON.parse(str));
        },
        enabled: !!board && !!columnKey,
        staleTime: 2 * 60 * 1000,
    });
};

export default useBoardTags;
