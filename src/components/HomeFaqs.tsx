export const HomeFaqs = () => {
  return (
    <div className="flex justify-center">
      <div className="min-w-[400px] max-w-screen-lg space-y-2">
        {[
          {
            title: 'How to use this tool?',
            content:
              'You can create posters and images through a simple drag-and-drop interface.',
          },
          {
            title: 'Is this tool free?',
            content: 'Yes, you can use our basic features for free.',
          },
          {
            title: 'Can I export my designs?',
            content: 'Of course, you can export your design in PNG format.',
          },
          {
            title: 'How to contact customer service?',
            content:
              'You can contact customer service through the contact form on our official website.',
          },
          {
            title: 'How to contact customer service?',
            content:
              'You can contact customer service through the contact form on our official website.You can contact customer service through the contact form on our official website.You can contact customer service through the contact form on our official website.You can contact customer service through the contact form on our official website.You can contact customer service through the contact form on our official website.',
          },
        ].map((item) => (
          <div className="collapse collapse-arrow border-base-300 bg-base-200/90 border backdrop-blur-md">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-xl font-medium text-white/80 peer-checked:bg-accent/90 peer-checked:text-accent-content">
              {item.title}
            </div>
            <div className="collapse-content text-lg peer-checked:bg-accent/90 peer-checked:text-accent-content">
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
