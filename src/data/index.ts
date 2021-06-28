import { User, Post, Comment } from '../types/backingTypes';
export let users: User[] = [
  {
    age: 25,
    fullName: 'pranshu shah',
    id: '11111',
    email: 'pranshu.shah23@gmail.com',
    posts: ['113'],
    comments: ['1', '4'],
  },
  {
    age: 25,
    fullName: 'disha shah',
    id: '11112',
    email: 'disha.shah@gmail.com',
    posts: [],
    comments: ['2'],
  },
  {
    age: 25,
    fullName: 'mit desai',
    id: '11113',
    email: 'mit.desai@gmail.com',
    posts: ['111', '112'],
    comments: ['3'],
  },
];

export let posts: Post[] = [
  {
    id: '111',
    title: 'first Post',
    body: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-S',
    published: false,
    author: '11113',
    comments: ['1'],
  },
  {
    id: '112',
    title: 'second Post',
    body: 'It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-S',
    published: true,
    author: '11113',
    comments: ['2', '3'],
  },
  {
    id: '113',
    title: 'third Post',
    body: 'Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-S',
    published: false,
    author: '11111',
    comments: ['4'],
  },
];

export let comments: Comment[] = [
  { id: '1', text: 'comment1', author: '11111', post: '111' },
  { id: '2', text: 'comment2', author: '11112', post: '112' },
  { id: '3', text: 'comment3', author: '11113', post: '112' },
  { id: '4', text: 'comment4', author: '11111', post: '113' },
];
