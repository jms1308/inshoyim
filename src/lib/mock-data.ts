import type { Post, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alisher Navoiy',
    email: 'alisher@navoiy.com',
    avatar_url: 'https://placehold.co/100x100.png',
    created_at: new Date().toISOString(),
    bio: 'Great poet of the Timurid era, philosopher, and statesman.',
  },
  {
    id: '2',
    name: 'Zahiriddin Muhammad Babur',
    email: 'babur@mughal.com',
    avatar_url: 'https://placehold.co/100x100.png',
    created_at: new Date().toISOString(),
    bio: 'Founder of the Mughal Empire and an accomplished writer.',
  },
   {
    id: '3',
    name: 'Sophia Blackwell',
    email: 'sophia@example.com',
    avatar_url: 'https://placehold.co/100x100.png',
    created_at: new Date().toISOString(),
    bio: 'Modern philosopher and technology ethicist exploring the digital age.',
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'The Art of Ghazal in the 15th Century',
    author_id: '1',
    content: `
## The Flourishing of a Poetic Form

The ghazal, a poetic form consisting of rhyming couplets and a refrain, reached its zenith in the 15th century. This period saw poets masterfully blend themes of love, longing, and metaphysics into intricate lyrical structures. The form, which had traveled from Arabia through Persia, found a unique and profound expression in the Chagatai language.

### Key Characteristics

- **Thematic Unity:** While each couplet (sher) can stand on its own as a complete thought, a successful ghazal maintains a consistent thematic and emotional thread.
- **The Maqta:** The final couplet of the ghazal, known as the maqta, traditionally includes the poet's pen name, or "takhallus." This serves as a personal signature, directly connecting the creator to their work.
- **Symbolism:** The imagery of the beloved, the wine-bearer (saqi), the nightingale, and the rose are not merely decorative. They are deep symbols representing divine beauty, spiritual guidance, the yearning soul, and the ephemeral nature of life.

This era's contribution was not just in perfecting the form, but in elevating its philosophical depth, making the ghazal a timeless vessel for expressing the human condition.
`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    views: 1450,
    tags: ['poetry', 'history', 'ghazal', 'literature'],
    status: 'published',
    read_time: 3,
  },
  {
    id: '2',
    title: 'Reflections from the Baburnama',
    author_id: '2',
    content: `
## A Memoir of Conquest and Nature

The Baburnama stands as a monumental work of autobiography, offering an unfiltered glimpse into the life of a conqueror, a ruler, and a keen observer of the natural world. It is more than a historical chronicle; it is a personal diary filled with candid reflections on victory, defeat, and the profound beauty of the lands I traversed.

### On Leadership and Exile

From the early struggles for Samarkand to the eventual establishment of an empire in Hindustan, the path was fraught with peril. These entries detail not just military strategies, but the emotional toll of exile and the resilience required to build a dynasty from nothing.

> "I have not written all this to complain: I have simply written the truth. I do not intend by what I have written to compliment myself: I have simply set down exactly what happened."

### A Naturalist's Eye

Beyond the battlefield, I found solace in documenting the flora and fauna of new territories. The description of Hindustan's gardens, fruits, and animals was a way to connect with a foreign land, to understand its essence. This appreciation for nature provided a balance to the turbulent life of a king and warrior.
`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    views: 2890,
    tags: ['memoir', 'history', 'mughal', 'babur'],
    status: 'published',
    read_time: 4,
  },
  {
    id: '3',
    title: 'The Digital Self: Identity in the Age of the Internet',
    author_id: '3',
    content: `
## Crafting Personas in a Virtual World

The advent of the internet has fundamentally altered our conception of self. We now curate digital identities across multiple platforms, each a carefully constructed facet of who we are—or who we wish to be. This essay explores the philosophical implications of the "digital self."

### Authenticity vs. Curation

Is the online persona an authentic extension of our being, or is it an inauthentic performance? The line blurs. Social media encourages us to present an idealized version of our lives, highlighting successes while hiding vulnerabilities. Yet, these digital spaces are also where we find communities, express niche interests, and explore aspects of our identity that may be suppressed in our physical lives.

### The Algorithm's Gaze

Our digital selves are not created in a vacuum. They are shaped and reflected back at us by algorithms that determine what we see, who we connect with, and how our content is perceived. This creates a feedback loop where the platform's logic begins to influence our self-perception. Are we becoming who the algorithm thinks we are? This question is central to understanding modern identity.
`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    views: 980,
    tags: ['technology', 'philosophy', 'identity', 'internet'],
    status: 'published',
    read_time: 3,
  },
  {
    id: '4',
    title: 'Unpublished Draft on Celestial Mechanics',
    author_id: '3',
    content: 'This is a draft about the complex motions of planets and stars. It needs more work and is currently over 70 words long to satisfy the validation requirement for creating a post, but it is not ready for public viewing yet. I am still researching the primary sources.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 0,
    tags: [],
    status: 'draft',
    read_time: 1,
  },
];
