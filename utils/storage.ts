export const keywordStorage = storage.defineItem<string[]>(
    'local:keywords',
    {
        defaultValue: ['ai'],
    }
);

export const extensionEnabledStorage = storage.defineItem<boolean>(
    'local:enabled',
    {
        defaultValue: true,
    }
);

export const hiddenCountStorage = storage.defineItem<number>(
    'local:hiddenCount',
    {
        defaultValue: 0,
    }
);

export const showHiddenPostsStorage = storage.defineItem<boolean>(
    'local:showHiddenPosts',
    {
        defaultValue: false,
    }
);
