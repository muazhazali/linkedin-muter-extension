export const keywordStorage = storage.defineItem<string[]>(
    'local:keywords',
    {
        defaultValue: ['ai'],
    }
);
