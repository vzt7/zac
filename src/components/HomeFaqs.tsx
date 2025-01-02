export const HomeFaqs = () => {
  return (
    <div className="flex justify-center">
      <div className="mx-4 max-w-screen-lg space-y-2">
        {[
          {
            title: 'How to use this tool?',
            content:
              'You can create posters and images through a simple drag-and-drop interface. In the near future you can also create animations.',
          },
          {
            title: 'Is this tool free?',
            content: 'Yes, you can use our basic features for free.',
          },
          {
            title: 'Can I export my designs?',
            content:
              'Of course, you can export your design in PNG format, and export animations in GIF/MP4 format.',
          },
          {
            title: 'What content is paid?',
            content:
              'The free content can meet the daily needs of most people, but if you need more advanced features, you may consider the paid plan. Paid content includes: advanced export of images/animations, cloud storage, increasing the project limit, etc. Please check the pricing page for details.',
          },
          {
            title: 'Who owns the copyright of the works?',
            content:
              'The free version currently does not support commercial use. If you have commercial needs, please upgrade to the paid plan.',
          },
        ].map((item, index) => (
          <div
            key={index}
            className="collapse collapse-arrow border-base-300 bg-base-200/90 border backdrop-blur-md"
          >
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
