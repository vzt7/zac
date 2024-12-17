import { useTemplates } from './SidebarTemplatesData';
import { handleAddImage, handleAddShape } from './editor.handler';

export const SidebarTemplates = () => {
  const { templates } = useTemplates();

  // 应用模板
  const handleApplyTemplate = (template: (typeof templates)[number]) => {
    console.log(template);
    template.elements.forEach((element) => {
      if (element.type === 'image') {
        handleAddImage({
          ...element,
        });
      } else {
        handleAddShape(element.type, {
          ...element,
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* 模板网格 */}
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col gap-2 p-2 border-2 rounded-lg hover:border-primary cursor-pointer transition-all"
            onClick={() => handleApplyTemplate(template)}
          >
            <div className="aspect-video bg-base-200 rounded-md overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm font-medium">{template.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
