import { Outlet } from '@remix-run/react';
import { mergeMeta } from '~/utils';

import type { Handle } from '~/types/handle';
import { searchPages } from '~/constants/tabLinks';
import { BreadcrumbItem } from '~/components/elements/Breadcrumb';

export const meta = mergeMeta(() => [
  { title: 'YouFlix - Search' },
  { name: 'description', content: 'Search Movies, Tv Series and Anime on YouFlix' },
  { property: 'og:url', content: 'https://youflix.xyz/search' },
  { property: 'og:title', content: 'YouFlix - Search' },
  { property: 'og:image', content: 'https://youflix.xyz/api/ogimage?it=search' },
  { property: 'og:description', content: 'Search Movies, Tv Series and Anime on YouFlix' },
  { name: 'twitter:title', content: 'YouFlix - Search' },
  { name: 'twitter:image', content: 'https://youflix.xyz/api/ogimage?it=search' },
  { name: 'twitter:description', content: 'Search Movies, Tv Series and Anime on YouFlix' },
]);

export const handle: Handle = {
  breadcrumb: ({ t }) => (
    <BreadcrumbItem to="/search" key="search">
      {t('search.action')}
    </BreadcrumbItem>
  ),
  showTabLink: true,
  tabLinkPages: searchPages,
  tabLinkTo: () => '/search/',
  miniTitle: ({ t }) => ({
    title: t('search.action'),
    showImage: false,
  }),
};

const SearchPage = () => <Outlet />;

export default SearchPage;
