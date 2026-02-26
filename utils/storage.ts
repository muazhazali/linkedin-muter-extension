export interface KeywordEntry {
    pattern: string;
    isRegex: boolean;
    count: number;
}

export const keywordStorage = storage.defineItem<KeywordEntry[]>(
    'local:keywords',
    {
        defaultValue: [{ pattern: 'ai', isRegex: false, count: 0 }],
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

export const muteSponsoredStorage = storage.defineItem<boolean>(
    'local:muteSponsored',
    {
        defaultValue: true,
    }
);
