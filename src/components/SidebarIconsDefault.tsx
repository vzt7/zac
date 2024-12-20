import icons from '@/assets/icons.json';
import { getShapeRandomId } from '@/utils/getRandomId';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimpleIcon } from 'simple-icons';
import * as simpleIcons from 'simple-icons';

import { handleAddSvgByTagStr } from './editor.handler';

const ITEMS_PER_PAGE = 300;

export const SidebarIconsDefault = () => {
  const [filteredIcons, setFilteredIcons] = useState<
    ((typeof icons)[number] | SimpleIcon)[]
  >([]);
  const [displayedIcons, setDisplayedIcons] = useState<
    ((typeof icons)[number] | SimpleIcon)[]
  >([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [allIcons] = useState(
    () =>
      [...icons, ...Object.values(simpleIcons)] as (
        | (typeof icons)[number]
        | SimpleIcon
      )[],
  );
  // 初始化图标
  useEffect(() => {
    setFilteredIcons(allIcons);
    setDisplayedIcons(allIcons.slice(0, ITEMS_PER_PAGE));
  }, []);

  const loadMore = useCallback(
    ({
      currentPage,
      displayedIcons: _displayedIcons,
      filteredIcons: _filteredIcons,
    }: {
      currentPage: number;
      filteredIcons: typeof filteredIcons;
      displayedIcons: typeof displayedIcons;
    }) => {
      setIsLoading(true);
      const nextPage = currentPage + 1;
      const newItems = _filteredIcons.slice(0, nextPage * ITEMS_PER_PAGE);

      // 如果没有新项目可加载，就不更新状态
      if (newItems.length === _displayedIcons.length) {
        setIsLoading(false);
        return;
      }

      setDisplayedIcons(newItems);
      setPage(nextPage);
      setIsLoading(false);
    },
    [],
  );

  // IntersectionObserver 设置
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore({
            currentPage: page,
            displayedIcons,
            filteredIcons,
          });
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedIcons, filteredIcons, isLoading, loadMore, page]);

  return (
    <div className="flex flex-col gap-4 pb-10 h-full">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search icons"
          className="input input-bordered w-full"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            setIsLoading(true);
            if (!searchTerm) {
              setFilteredIcons(allIcons);
              setDisplayedIcons(allIcons.slice(0, ITEMS_PER_PAGE));
            } else {
              const filtered = allIcons.filter((icon) =>
                'title' in icon
                  ? icon.title.toLowerCase().includes(searchTerm)
                  : 'name' in icon
                    ? icon.name.toLocaleLowerCase().includes(searchTerm)
                    : false,
              );
              setFilteredIcons(filtered);
              setDisplayedIcons(filtered.slice(0, ITEMS_PER_PAGE));
            }
            setPage(1);
            setIsLoading(false);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {displayedIcons.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer hover:bg-base-300 bg-base-200 dark:border-gray-600 border-gray-300 hover:border-primary transition-colors"
              onClick={async () => {
                if ('svg' in item && item?.svg) {
                  handleAddSvgByTagStr(item.svg, {
                    name: getShapeRandomId(`icon-${item.title}`),
                  });
                }
                if ('url' in item && item.url) {
                  const svg = await fetch(item.url)
                    .then((res) => res.text())
                    .catch(() => null);
                  if (!svg) {
                    return;
                  }
                  handleAddSvgByTagStr(svg, {
                    name: getShapeRandomId(`icon-${item.name}`),
                  });
                }
              }}
            >
              <div
                className="w-16 h-16 flex items-center justify-center rounded-md overflow-hidden *:object-cover *:fill-current"
                dangerouslySetInnerHTML={
                  'svg' in item && item?.svg
                    ? {
                        __html: item.svg,
                      }
                    : undefined
                }
              >
                {'url' in item && item.url ? (
                  <img src={item.url} className="w-full h-full" />
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* 观察目标元素 */}
        <div ref={observerTarget} className="h-4 w-full" />

        {/* 加载状态指示器 */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarIconsDefault;
