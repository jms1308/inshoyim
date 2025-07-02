-- Insert sample posts
INSERT INTO posts (title, content, author, excerpt) VALUES 
(
    'The Art of Minimalist Design',
    'Minimalism in design is not just about using less elements, but about using the right elements. It''s about creating clarity, focus, and purpose in every design decision we make.

When we strip away the unnecessary, we reveal the essential. This principle applies not just to visual design, but to user experience, content strategy, and even business models.

The challenge lies not in what to include, but in what to leave out. Every element must earn its place through function, not just form. This creates designs that are not only beautiful, but purposeful and sustainable.

In our digital age, where attention is scarce and distractions are abundant, minimalist design becomes a form of respect for the user''s time and cognitive load.',
    'Sarah Chen',
    'Minimalism in design is not just about using less elements, but about using the right elements. It''s about creating clarity, focus, and purpose...'
),
(
    'Building Resilient Systems',
    'In software engineering, resilience is the ability of a system to handle and recover from failures gracefully. It''s not about preventing all failures—that''s impossible—but about designing systems that can adapt and continue functioning when things go wrong.

The key principles of resilient systems include redundancy, graceful degradation, circuit breakers, and monitoring. Each of these plays a crucial role in maintaining system stability under stress.

Redundancy ensures that if one component fails, others can take over. Graceful degradation means that when a system is under stress, it reduces functionality rather than failing completely. Circuit breakers prevent cascading failures by stopping requests to failing services.

But perhaps most importantly, resilient systems are observable. You can''t fix what you can''t see, and you can''t improve what you don''t measure.',
    'Alex Rodriguez',
    'In software engineering, resilience is the ability of a system to handle and recover from failures gracefully. It''s not about preventing all failures...'
),
(
    'The Future of Remote Work',
    'The pandemic accelerated a transformation that was already underway: the shift toward remote and hybrid work models. But as we settle into this new reality, we''re discovering that remote work is not just "office work from home"—it''s a fundamentally different way of working.

Successful remote work requires intentional communication, asynchronous collaboration, and a results-oriented culture. It demands new skills from both managers and individual contributors.

The companies that thrive in this environment are those that embrace the unique advantages of remote work: access to global talent, reduced overhead costs, and improved work-life balance for employees.

However, remote work also presents challenges: maintaining company culture, ensuring effective collaboration, and preventing isolation. The future likely lies not in choosing between remote and in-person work, but in thoughtfully combining both.',
    'Maya Patel',
    'The pandemic accelerated a transformation that was already underway: the shift toward remote and hybrid work models. But as we settle into this new reality...'
);

-- Insert sample comments
INSERT INTO comments (post_id, content, author) VALUES 
(1, 'This really resonates with me. I''ve been trying to apply minimalist principles to my own design work, and the hardest part is indeed knowing what to leave out.', 'Design Student'),
(1, 'Great article! I''d love to see some concrete examples of before/after designs that demonstrate these principles.', 'Jennifer Kim'),
(2, 'As a DevOps engineer, I can confirm that observability is absolutely crucial. You can''t manage what you can''t measure.', 'Tech Lead'),
(3, 'Remote work has definitely changed how I approach my daily routine. The flexibility is amazing, but it does require more self-discipline.', 'Remote Worker');
