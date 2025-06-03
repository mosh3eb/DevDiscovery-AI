
import { CharacteristicOption, PlatformOption } from './types';

export const CHARACTERISTICS_OPTIONS: CharacteristicOption[] = [
  { id: 'beginner-friendly', label: 'Beginner-Friendly' },
  { id: 'good-first-issues', label: 'Good First Issues' },
  { id: 'actively-maintained', label: 'Actively Maintained' },
  { id: 'good-documentation', label: 'Good Documentation' },
  { id: 'large-community', label: 'Large Community' },
  { id: 'cutting-edge-tech', label: 'Cutting-Edge Tech' },
  { id: 'needs-contributors', label: 'Needs Contributors' },
];

export const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'github', label: 'GitHub', apiUrl: 'https://api.github.com/search/repositories', isImplemented: true, type: 'code_hosting' },
  { id: 'gitlab', label: 'GitLab', apiUrl: 'https://gitlab.com/api/v4/projects', isImplemented: true, type: 'code_hosting' },
  { id: 'bitbucket', label: 'Bitbucket', apiUrl: 'https://api.bitbucket.org/2.0/repositories', isImplemented: false, type: 'code_hosting' },
  { id: 'codeberg', label: 'Codeberg', apiUrl: 'https://codeberg.org/api/v1/repos/search', isImplemented: true, type: 'code_hosting' },
  { id: 'sourceforge', label: 'SourceForge', apiUrl: 'https://sourceforge.net/directory/', isImplemented: false, type: 'code_hosting' }, 
  { id: 'npm', label: 'NPM', apiUrl: 'https://registry.npmjs.org/-/v1/search', isImplemented: true, type: 'package_registry' },
  { id: 'pypi', label: 'PyPI', apiUrl: 'https://pypi.org/search/', isImplemented: false, type: 'package_registry' }, 
  { id: 'packagist', label: 'Packagist', apiUrl: 'https://packagist.org/search.json', isImplemented: true, type: 'package_registry' },
  { id: 'rubygems', label: 'RubyGems', apiUrl: 'https://rubygems.org/api/v1/search.json', isImplemented: false, type: 'package_registry' },
  { id: 'crates-io', label: 'Crates.io', apiUrl: 'https://crates.io/api/v1/crates', isImplemented: true, type: 'package_registry' },
  { id: 'maven-central', label: 'Maven Central', apiUrl: 'https://search.maven.org/solrsearch/select', isImplemented: true, type: 'package_registry' },
  { id: 'nuget', label: 'NuGet', apiUrl: 'https://api.nuget.org/v3/query', isImplemented: true, type: 'package_registry' }, 
  { id: 'libraries-io', label: 'Libraries.io', apiUrl: 'https://libraries.io/api', isImplemented: false, type: 'aggregator' }, 
  { id: 'open-hub', label: 'Open Hub', apiUrl: 'https://www.openhub.net', isImplemented: false, type: 'aggregator' }, 
  { id: 'f-droid', label: 'F-Droid', apiUrl: 'https://f-droid.org/repo/index.xml', isImplemented: false, type: 'mobile_open_source' },
];
