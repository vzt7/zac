import {
  PIXABAY_CATEGORY,
  PIXABAY_COLORS,
  PIXABAY_IMAGE_TYPE,
  createPixabayRequestUrl,
  usePixabayApi,
} from '@/hooks/usePixabayApi';
import { useEffect, useState } from 'react';

import {
  PixabayImageList,
  PixabayImageListRateLimitTip,
  PixabayImageListSearchInput,
} from './PixabayImageList';

export const SidebarImages = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string | null>(null);

  const [category, setCategory] = useState<PIXABAY_CATEGORY>(
    PIXABAY_CATEGORY.BACKGROUNDS,
  );
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as PIXABAY_CATEGORY);
    setPage(1);
  };

  const [imageType, setImageType] = useState<PIXABAY_IMAGE_TYPE>(
    PIXABAY_IMAGE_TYPE.ALL,
  );
  const handleImageTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageType(e.target.value as PIXABAY_IMAGE_TYPE);
    setPage(1);
  };

  const [colors, setColors] = useState<PIXABAY_COLORS>(PIXABAY_COLORS.ALL);
  const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColors(e.target.value as PIXABAY_COLORS);
    setPage(1);
  };

  const {
    data: rawData,
    isLoading: isLoadingPixabayBackgrounds,
    error,
    refetch,
  } = usePixabayApi(
    createPixabayRequestUrl({
      page,
      search,
      category,
      image_type: imageType,
      colors,
    }),
  );
  const [pixabayBackgrounds, setPixabayBackgrounds] = useState<
    typeof rawData | null
  >(null);
  useEffect(() => {
    if (!rawData) return;

    setPixabayBackgrounds((prev) =>
      rawData.args.page === 1
        ? rawData
        : {
            ...rawData,
            hits: [...(prev?.hits || []), ...(rawData?.hits || [])],
          },
    );
  }, [rawData]);

  const handleSearch = (searchValue: string) => {
    if (searchValue === search && page === 1) {
      refetch();
    } else {
      setSearch(searchValue);
      setPage(1);
    }
  };

  // Handle rate limit error
  if (error) {
    return <PixabayImageListRateLimitTip data={rawData} onRefetch={refetch} />;
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      <h3 className="text-lg font-bold pb-1">Images</h3>
      <p className="text-sm text-gray-500 pb-2">
        Click to add image to canvas as background.
      </p>

      {/* Category Selector */}
      <div className="w-full flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-semibold ml-1">
          Category
        </label>
        <select
          id="category"
          className="select select-bordered select-sm h-10 w-full"
          onChange={handleCategoryChange}
          value={category}
        >
          <option value={PIXABAY_CATEGORY.ALL}>All</option>
          <option value={PIXABAY_CATEGORY.BACKGROUNDS}>Backgrounds</option>
          <option value={PIXABAY_CATEGORY.FASHION}>Fashion</option>
          <option value={PIXABAY_CATEGORY.NATURE}>Nature</option>
          <option value={PIXABAY_CATEGORY.SCIENCE}>Science</option>
          <option value={PIXABAY_CATEGORY.EDUCATION}>Education</option>
          <option value={PIXABAY_CATEGORY.FEELINGS}>Feelings</option>
          <option value={PIXABAY_CATEGORY.HEALTH}>Health</option>
          <option value={PIXABAY_CATEGORY.PEOPLE}>People</option>
          <option value={PIXABAY_CATEGORY.RELIGION}>Religion</option>
          <option value={PIXABAY_CATEGORY.PLACES}>Places</option>
          <option value={PIXABAY_CATEGORY.ANIMALS}>Animals</option>
          <option value={PIXABAY_CATEGORY.INDUSTRIES}>Industry</option>
          <option value={PIXABAY_CATEGORY.COMPUTER}>Computer</option>
          <option value={PIXABAY_CATEGORY.FOOD}>Food</option>
          <option value={PIXABAY_CATEGORY.SPORTS}>Sports</option>
          <option value={PIXABAY_CATEGORY.TRANSPORTATION}>
            Transportation
          </option>
          <option value={PIXABAY_CATEGORY.TRAVEL}>Travel</option>
          <option value={PIXABAY_CATEGORY.BUILDINGS}>Buildings</option>
          <option value={PIXABAY_CATEGORY.BUSINESS}>Business</option>
          <option value={PIXABAY_CATEGORY.MUSIC}>Music</option>
        </select>
      </div>

      <div className="w-full flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-semibold ml-1">
          Image Type
        </label>
        <div className="flex flex-row flex-wrap gap-2">
          <div className="form-control">
            <label className="label cursor-pointer flex gap-2">
              <input
                type="radio"
                name="radio-10"
                className="radio radio-sm"
                onChange={handleImageTypeChange}
                value={PIXABAY_IMAGE_TYPE.ALL}
                defaultChecked
              />
              <span className="label-text">ALL</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer flex gap-2">
              <input
                type="radio"
                name="radio-10"
                className="radio radio-sm checked:bg-red-500"
                onChange={handleImageTypeChange}
                value={PIXABAY_IMAGE_TYPE.PHOTO}
              />
              <span className="label-text">Photo</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer flex gap-2">
              <input
                type="radio"
                name="radio-10"
                className="radio radio-sm checked:bg-blue-500"
                onChange={handleImageTypeChange}
                value={PIXABAY_IMAGE_TYPE.ILLUSTRATION}
              />
              <span className="label-text">Illustration</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer flex gap-2">
              <input
                type="radio"
                name="radio-10"
                className="radio radio-sm checked:bg-green-500"
                onChange={handleImageTypeChange}
                value={PIXABAY_IMAGE_TYPE.VECTOR}
              />
              <span className="label-text">Vector</span>
            </label>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-semibold ml-1">
          Colors
        </label>
        <div className="flex flex-row flex-wrap gap-2">
          {(
            Object.keys(PIXABAY_COLORS) as Array<keyof typeof PIXABAY_COLORS>
          ).map((key) => (
            <div key={key} className="form-control">
              <label className="label cursor-pointer flex gap-2">
                <input
                  type="radio"
                  name="radio-colors"
                  className={`radio radio-sm`}
                  onChange={handleColorsChange}
                  value={PIXABAY_COLORS[key]}
                  defaultChecked={key === 'ALL'}
                />
                <span className="label-text">
                  {PIXABAY_COLORS[key] || 'ALL'}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="w-full mb-4">
        <PixabayImageListSearchInput
          isLoading={isLoadingPixabayBackgrounds}
          isDisabled={isLoadingPixabayBackgrounds}
          onSearch={handleSearch}
        />
      </div>

      {pixabayBackgrounds && (
        <PixabayImageList
          data={pixabayBackgrounds}
          isLoading={isLoadingPixabayBackgrounds}
          onChangePage={setPage}
        />
      )}
    </div>
  );
};
