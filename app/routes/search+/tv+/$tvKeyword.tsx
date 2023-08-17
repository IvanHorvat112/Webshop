import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { mergeMeta } from '~/utils';
import { motion, type PanInfo } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils';

import type { Handle } from '~/types/handle';
import { i18next } from '~/services/i18n';
import { authenticate } from '~/services/supabase';
import { getSearchTvShows } from '~/services/tmdb/tmdb.server';
import { CACHE_CONTROL } from '~/utils/server/http';
import { useTypedRouteLoaderData } from '~/hooks/useTypedRouteLoaderData';
import MediaList from '~/components/media/MediaList';
import { BreadcrumbItem } from '~/components/elements/Breadcrumb';
import SearchForm from '~/components/elements/SearchForm';

export const loader = async ({ request, params }: LoaderArgs) => {
  const [, locale] = await Promise.all([
    authenticate(request, undefined, true),
    i18next.getLocale(request),
  ]);

  const keyword = params?.tvKeyword || '';
  const url = new URL(request.url);
  let page = Number(url.searchParams.get('page')) || undefined;
  if (page && (page < 1 || page > 1000)) page = 1;
  return json(
    {
      searchResults: await getSearchTvShows(keyword, page, locale),
    },
    {
      headers: { 'Cache-Control': CACHE_CONTROL.search },
    },
  );
};

export const meta = mergeMeta(({ data, params }) => {
  const { searchResults } = data;
  return [
    { title: `YouFlix - Search results for ${params.tvKeyword}` },
    {
      name: 'keywords',
      content: `Watch ${params.tvKeyword}, Stream ${params.tvKeyword}, Watch ${params.tvKeyword} HD, Online ${params.tvKeyword}, Streaming ${params.tvKeyword}, English, Subtitle ${params.tvKeyword}, English Subtitle`,
    },
    { property: 'og:url', content: `https://youflix.xyz/search/tv/${params.tvKeyword}` },
    { property: 'og:title', content: `YouFlix - Search results for ${params.tvKeyword}` },
    {
      property: 'og:image',
      content: searchResults?.items[0]?.backdropPath || searchResults?.items[0]?.posterPath || '',
    },
    {
      name: 'twitter:image',
      content: searchResults?.items[0]?.backdropPath || searchResults?.items[0]?.posterPath || '',
    },
    { name: 'twitter:title', content: `YouFlix - Search results for ${params.tvKeyword}` },
  ];
});

export const handle: Handle = {
  breadcrumb: ({ match }) => (
    <BreadcrumbItem
      to={`/search/tv/${match.params.tvKeyword}`}
      key={`search-tv-${match.params.tvKeyword}`}
    >
      {match.params.tvKeyword}
    </BreadcrumbItem>
  ),
  miniTitle: ({ match }) => ({
    title: 'Search results',
    subtitle: match.params.tvKeyword,
    showImage: false,
  }),
  showListViewChangeButton: true,
};

const SearchRoute = () => {
  const { searchResults } = useLoaderData<typeof loader>() || {};
  const rootData = useTypedRouteLoaderData('root');
  const navigate = useNavigate();
  const location = useLocation();
  const isHydrated = useHydrated();
  const { t } = useTranslation();

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset?.x > 100) {
      navigate('/search/movie');
    }
    if (info.offset?.x < -100 && info.offset?.y > -50) {
      navigate('/search/anime');
    }
  };

  const onSubmit = (value: string) => {
    navigate(`/search/tv/${value}`);
  };

  return (
    <motion.div
      key={location.key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col items-center justify-center px-3 sm:px-0"
      drag={isMobile && isHydrated ? 'x' : false}
      dragConstraints={isMobile && isHydrated ? { left: 0, right: 0 } : false}
      dragElastic={isMobile && isHydrated ? 0.7 : false}
      onDragEnd={handleDragEnd}
      dragDirectionLock={isMobile && isHydrated}
      draggable={isMobile && isHydrated}
    >
      <SearchForm
        onSubmit={onSubmit}
        textHelper={t('search.helper.tv')}
        textOnButton={t('search.action')}
        textPlaceHolder={t('search.placeHolder.tv')}
      />
      <MediaList
        currentPage={searchResults?.page}
        genresMovie={rootData?.genresMovie}
        genresTv={rootData?.genresTv}
        items={searchResults?.items}
        itemsType="tv"
        listName={t('search.searchResults')}
        listType="grid"
        showListTypeChangeButton
        totalPages={searchResults?.totalPages}
      />
    </motion.div>
  );
};

export default SearchRoute;