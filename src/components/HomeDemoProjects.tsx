export const HomeDemoProjects = () => {
  const handleClick = () => {};

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 max-w-screen-2xl mx-auto px-4">
      {[
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
        {
          title: 'How to center an element using JavaScript and jQuery',
          tags: ['Snippet', 'JavaScript'],
        },
      ].map((item) => (
        <article
          className="relative overflow-hidden rounded-lg shadow hover:shadow-lg hover:border-primary border-2 border-transparent transition-all cursor-pointer backdrop-blur-md"
          onClick={handleClick}
        >
          <img
            alt=""
            src={'/logo.png'}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="relative bg-gradient-to-t from-gray-900/50 to-gray-900/25 pt-32 sm:pt-48 lg:pt-64">
            <div className="p-4 sm:p-6">
              <h3 className="mt-0.5 text-lg text-white">{item.title}</h3>

              <p className="mt-2 line-clamp-3 text-sm/relaxed text-white/95 space-x-2">
                {item.tags.map((tag) => (
                  <span
                    className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
