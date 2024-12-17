import { getShapeRandomId } from '@/utils/getRandomId';
import { Icon, IconifyIcon } from '@iconify/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { ArrowLeft, Ellipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { InView } from 'react-intersection-observer';

import { handleAddSvgByTagStr } from './editor.handler';

const ICONIFY_API = 'https://api.iconify.design';

const useIconSets = () => {
  return useQuery<
    [
      string,
      {
        name: string;
        total: number;
        author?: {
          name: string;
          url: string;
        };
        license?: {
          title: string;
          spdx: string;
          url: string;
        };
        samples?: Array<string>;
        height: number;
        category: string;
        palette: boolean;
      },
    ][]
  >({
    queryKey: ['iconify-icon-sets'],
    queryFn: () => {
      return fetch(`${ICONIFY_API}/collections`)
        .then((res) => res.json())
        .then((res) => Object.entries(res));
    },
  });
};

export const SidebarIconsMore = () => {
  // icon集合
  const { data: iconSets, isPending: isIconSetsLoading } = useIconSets();
  const [filteredIconSets, setFilteredIconSets] = useState<typeof iconSets>();

  // 当前icon集合Id
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  // 当前icon集合的icons
  const {
    data: icons,
    isPending: isIconsLoading,
    mutateAsync: getIcons,
    reset: resetIcons,
  } = useMutation<string[]>({
    mutationFn: () => {
      return fetch(`${ICONIFY_API}/collection?prefix=${currentSetId}`)
        .then((res) => res.json())
        .then(
          (res: {
            prefix: string;
            total: number;
            title: string;
            uncategorized?: Array<string>;
            categories?: Record<string, string[]>;
            hidden?: Array<string>;
          }) =>
            (res.uncategorized || []).concat(
              Object.values(res.categories || {}).flat(),
            ),
        );
    },
  });
  const [filteredIcons, setFilteredIcons] = useState<typeof icons>();
  useEffect(() => {
    if (currentSetId) {
      getIcons();
    } else {
      resetIcons();
    }
  }, [currentSetId]);

  // 获取icon集合的指定icons数据
  const { mutateAsync: getIconData } = useMutation({
    mutationFn: async ({
      iconSet,
      icons,
    }: {
      iconSet: string;
      icons: string[];
    }) => {
      const res = await fetch(
        `${ICONIFY_API}/${iconSet}.json?icons=${icons?.join(',')}`,
      ).then((res) => res.json());
      return res as {
        icons: Record<string, IconifyIcon>;
      };
    },
  });

  const handleAddIcon = async (iconSet: string, icon: string) => {
    setLoadingItem({ iconSet, icon });
    const { icons } = await getIconData({
      iconSet,
      icons: [icon],
    });
    for (const iconItem of Object.values(icons)) {
      handleAddSvgByTagStr(iconItem.body, {
        name: getShapeRandomId(`icon-${icon}`),
      });
    }
    setLoadingItem(null);
  };

  const [loadingItem, setLoadingItem] = useState<{
    iconSet: string;
    icon: string;
  } | null>(null);

  const [debounceHandleSearch] = useState(() =>
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value.toLowerCase();
      console.log(searchTerm, currentSetId);
      if (currentSetId) {
        setFilteredIcons(
          searchTerm
            ? icons?.filter((icon) => icon.includes(searchTerm))
            : icons,
        );
      } else {
        setFilteredIconSets(
          searchTerm
            ? iconSets?.filter(
                ([id, itemSet]) =>
                  itemSet.name?.toLowerCase().includes(searchTerm) ||
                  itemSet.category?.toLowerCase().includes(searchTerm) ||
                  itemSet.samples?.some((item) => item.includes(searchTerm)),
              )
            : iconSets,
        );
      }
    }, 200),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-col items-center justify-between">
        {currentSetId && (
          <button
            className="btn btn-outline w-full dark:border-gray-600 border-gray-300 mb-3"
            onClick={() => setCurrentSetId(null)}
          >
            <ArrowLeft />
            <span>Back to Categories</span>
          </button>
        )}

        <input
          type="text"
          placeholder={currentSetId ? 'Search icons' : 'Search categories'}
          className="input input-bordered w-full"
          onChange={(e) => debounceHandleSearch(e)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {(isIconSetsLoading || isIconsLoading) && <div>Loading...</div>}

        <div ref={containerRef} className={`overflow-y-auto`}>
          {(filteredIconSets || iconSets) &&
            !currentSetId &&
            (filteredIconSets || iconSets)?.map(([id, itemSet], index) => (
              <InView
                key={`${id}_${index}`}
                rootMargin="50% 0% 50% 0%"
                delay={400}
              >
                {({ inView, ref, entry }) => (
                  <div ref={ref} className="min-h-16">
                    {inView && (
                      <CategoryItem
                        itemSetId={id}
                        itemSet={itemSet}
                        loading={loadingItem}
                        onClick={(itemSetId, itemIcon) =>
                          handleAddIcon(itemSetId, itemIcon)
                        }
                        onLoadMore={() => {
                          setCurrentSetId(id);
                          containerRef.current?.scrollTo({
                            top: 0,
                            behavior: 'smooth',
                          });
                        }}
                      />
                    )}
                  </div>
                )}
              </InView>
            ))}
        </div>

        <div className="overflow-y-auto grid grid-cols-4 gap-1">
          {(filteredIcons || icons) &&
            currentSetId &&
            (filteredIcons || icons)?.map((icon, index) => (
              <InView
                key={`${icon}_${index}`}
                rootMargin="50% 0% 50% 0%"
                delay={400}
              >
                {({ inView, ref, entry }) => (
                  <div ref={ref} className="min-h-16">
                    {inView && (
                      <IconItem
                        itemSetId={currentSetId}
                        itemIcon={icon}
                        loading={loadingItem}
                        onClick={(itemSetId, itemIcon) =>
                          handleAddIcon(itemSetId, itemIcon)
                        }
                      />
                    )}
                  </div>
                )}
              </InView>
            ))}
        </div>
      </div>
    </div>
  );
};

const CategoryItem = ({
  itemSetId,
  itemSet,
  loading,
  onClick,
  onLoadMore,
}: {
  itemSetId: string;
  itemSet: NonNullable<ReturnType<typeof useIconSets>['data']>[number][1];
  loading: {
    iconSet: string;
    icon: string;
  } | null;
  onClick: (itemSetId: string, itemIcon: string) => void;
  onLoadMore: () => void;
}) => {
  return (
    <div key={itemSetId} className="flex flex-col">
      <h3 className="text-lg font-semibold pb-2">{itemSet.name}</h3>
      <div className="grid grid-cols-3 gap-2">
        {itemSet.samples?.map((sample, index) => (
          <IconItem
            key={`${sample}_${index}`}
            itemSetId={itemSetId}
            itemIcon={sample}
            loading={loading}
            onClick={onClick}
          />
        ))}
      </div>
      <button
        className="btn btn-outline w-full dark:border-gray-600 border-gray-300 my-3"
        onClick={onLoadMore}
      >
        <Ellipsis size={24} />
      </button>
    </div>
  );
};

const IconItem = ({
  itemSetId,
  itemIcon,
  loading,
  onClick,
}: {
  itemSetId: string;
  itemIcon: string;
  loading: {
    iconSet: string;
    icon: string;
  } | null;
  onClick: (itemSetId: string, itemIcon: string) => void;
}) => {
  const isLoading =
    loading?.iconSet === itemSetId && loading?.icon === itemIcon;

  return (
    <div
      className="relative flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer hover:bg-base-300 bg-base-200 dark:border-gray-600 border-gray-300 hover:border-primary transition-colors overflow-hidden min-h-12"
      onClick={() => (isLoading ? null : onClick(itemSetId, itemIcon))}
    >
      <Icon icon={`${itemSetId}:${itemIcon}`} fontSize={48} />
      {isLoading && (
        <div className="absolute top-0 left-0 bg-base-200/80 w-full h-full flex items-center justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      )}
    </div>
  );
};

export default SidebarIconsMore;
