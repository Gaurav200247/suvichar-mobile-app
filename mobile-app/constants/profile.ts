// Profile Screen Constants
import { ImageSourcePropType } from 'react-native';

export interface DownloadedQuote {
  id: number;
  thumbnail: ImageSourcePropType;
  title: string;
  date: string;
}

export const DOWNLOADED_QUOTES: DownloadedQuote[] = [
  {
    id: 1,
    thumbnail: require('../assets/Quote JPEGS/1.jpg'),
    title: 'Motivational Quote',
    date: '2024-01-15',
  },
  {
    id: 2,
    thumbnail: require('../assets/Quote JPEGS/2.jpg'),
    title: 'Good Morning Quote',
    date: '2024-01-14',
  },
  {
    id: 3,
    thumbnail: require('../assets/Quote JPEGS/3.jpg'),
    title: 'Love Quote',
    date: '2024-01-13',
  },
  {
    id: 4,
    thumbnail: require('../assets/Quote JPEGS/4.jpg'),
    title: 'Religious Quote',
    date: '2024-01-12',
  },
  {
    id: 5,
    thumbnail: require('../assets/Quote JPEGS/5.jpg'),
    title: 'Friendship Quote',
    date: '2024-01-11',
  },
  {
    id: 6,
    thumbnail: require('../assets/Quote JPEGS/6.jpg'),
    title: 'Success Quote',
    date: '2024-01-10',
  },
  {
    id: 7,
    thumbnail: require('../assets/Quote JPEGS/7.jpg'),
    title: 'Wisdom Quote',
    date: '2024-01-09',
  },
  {
    id: 8,
    thumbnail: require('../assets/Quote JPEGS/8.jpg'),
    title: 'Happiness Quote',
    date: '2024-01-08',
  },
  {
    id: 9,
    thumbnail: require('../assets/Quote JPEGS/9.jpg'),
    title: 'Nature Quote',
    date: '2024-01-07',
  },
];

