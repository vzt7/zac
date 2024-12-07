import { Settings } from 'lucide-react';
import { ChangeEvent, useEffect, useRef } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape, useEditorStore } from '../editor.store';
import { ElementRichTextEditor } from './ElementRichTextEditor';

const PRESET_COLORS = [
  '#2563EB', // 蓝色
  '#10B981', // 绿色
  '#F59E0B', // 橙色
  '#EC4899', // 粉色
  '#8B5CF6', // 紫色
  '#06B6D4', // 青色
  '#000000', // 黑色
  '#6B7280', // 灰色
  '#ffffff', // 白色
];

// 添加新的常量配置
const STEP_CONFIG = {
  position: 1, // 位置步进
  size: 1, // 尺寸步进
  rotation: 1, // 旋转步进
  scale: 0.1, // 缩放步进
  opacity: 0.01, // 透明度步进
  stroke: 0.5, // 描边宽度步进
  shadow: 1, // 阴影偏移步进
};

export const PropertiesPanel = () => {
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);
  const selectedShape = shapes.find((s) => selectedIds.includes(s.id)) || null;

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    property: keyof Shape,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const finalValue =
        property === 'x' || property === 'y' ? Math.round(value) : value;
      handleUpdate({ [property]: finalValue, id: selectedShape!.id });
    }
  };

  const handleColorInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleUpdate({ fill: e.target.value, id: selectedShape!.id });
  };

  const handleEffectChange = (effect: string, value: number | string) => {
    handleUpdate({ [effect]: value, id: selectedShape!.id });
  };

  // 添加格式化数字的辅助函数
  const formatNumber = (value: number, precision: number = 2) => {
    return Number(value.toFixed(precision));
  };

  const contentRef = useRef<HTMLDivElement>(null);
  // 添加滚动到顶部的处理函数
  const handleScrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!selectedShape) return null;

  return (
    <>
      <div
        className="flex items-center gap-2 pb-4 cursor-pointer hover:text-primary transition-colors"
        onClick={handleScrollToTop}
      >
        <Settings size={20} />
        <span className="font-bold">属性设置</span>
      </div>

      <div
        ref={contentRef}
        className="space-y-3 pb-12 pr-2 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 如果选中的是文本元素，显示文本编辑器 */}
        {selectedShape.type === 'text' && (
          <ElementRichTextEditor selectedShape={selectedShape} />
        )}

        <div className="collapse collapse-arrow bg-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-medium">基础属性</div>
          <div className="collapse-content space-y-4">
            {/* 位置 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">位置</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">
                    <span className="label-text-alt">X</span>
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedShape.x)}
                    onChange={(e) => handleNumberInput(e, 'x')}
                    className="input input-bordered input-sm w-full"
                    step={1}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text-alt">Y</span>
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedShape.y)}
                    onChange={(e) => handleNumberInput(e, 'y')}
                    className="input input-bordered input-sm w-full"
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* 大小 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">大小</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {selectedShape.type === 'rect' ? (
                  <>
                    <div>
                      <label className="label">
                        <span className="label-text-alt">宽度</span>
                      </label>
                      <input
                        type="number"
                        value={selectedShape.width}
                        onChange={(e) => handleNumberInput(e, 'width')}
                        className="input input-bordered input-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text-alt">高度</span>
                      </label>
                      <input
                        type="number"
                        value={selectedShape.height}
                        onChange={(e) => handleNumberInput(e, 'height')}
                        className="input input-bordered input-sm w-full"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="label">
                      <span className="label-text-alt">半径</span>
                    </label>
                    <input
                      type="number"
                      value={selectedShape.radius}
                      onChange={(e) => handleNumberInput(e, 'radius')}
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 旋转 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">旋转</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedShape.rotation}
                onChange={(e) => handleNumberInput(e, 'rotation')}
                className="range range-primary range-sm"
              />
              <div className="w-full flex justify-between text-xs px-2">
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>
            </div>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-medium">样式</div>
          <div className="collapse-content space-y-4">
            {/* 颜色选择器 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">填充颜色</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      background: color,
                      border: '2px solid transparent',
                      borderColor:
                        selectedShape.fill === color
                          ? '#2563EB'
                          : 'transparent',
                    }}
                    onClick={() =>
                      handleUpdate({ fill: color, id: selectedShape!.id })
                    }
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedShape.fill?.toString() || '#000000'}
                onChange={handleColorInput}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            {/* 描边样式 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">描边样式</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="select select-bordered select-sm"
                  value={selectedShape.lineCap || 'butt'}
                  onChange={(e) =>
                    handleEffectChange('lineCap', e.target.value)
                  }
                >
                  <option value="butt">平直</option>
                  <option value="round">圆形</option>
                  <option value="square">方形</option>
                </select>
                <select
                  className="select select-bordered select-sm"
                  value={selectedShape.lineJoin || 'miter'}
                  onChange={(e) =>
                    handleEffectChange('lineJoin', e.target.value)
                  }
                >
                  <option value="miter">尖角</option>
                  <option value="round">圆角</option>
                  <option value="bevel">斜角</option>
                </select>
              </div>
            </div>

            {/* 虚线设置 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">虚线</span>
              </label>
              <div className="join w-full">
                <input
                  type="number"
                  value={
                    selectedShape.dashEnabled ? selectedShape.dash?.[0] || 5 : 0
                  }
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleUpdate({
                      dashEnabled: value > 0,
                      dash: value > 0 ? [value, value] : undefined,
                      id: selectedShape!.id,
                    });
                  }}
                  className="input input-bordered input-sm w-24 join-item"
                  min="0"
                  max="20"
                />
                <select
                  className="select select-bordered select-sm join-item"
                  value={selectedShape.dash?.join(',') || '5,5'}
                  onChange={(e) => {
                    const [a, b] = e.target.value.split(',').map(Number);
                    handleUpdate({
                      dash: [a, b],
                      dashEnabled: true,
                      id: selectedShape!.id,
                    });
                  }}
                >
                  <option value="5,5">均匀</option>
                  <option value="10,5">长短</option>
                  <option value="15,5,5,5">点划线</option>
                </select>
              </div>
            </div>

            {/* 圆角设置 (仅对矩形生效) */}
            {selectedShape.type === 'rect' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">圆角</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={selectedShape.cornerRadius || 0}
                  onChange={(e) =>
                    handleEffectChange('cornerRadius', Number(e.target.value))
                  }
                  className="range range-primary range-sm"
                />
              </div>
            )}

            {/* 添加透明度控制 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">透明度</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step={STEP_CONFIG.opacity}
                value={selectedShape.opacity || 1}
                onChange={(e) =>
                  handleEffectChange('opacity', Number(e.target.value))
                }
                className="range range-primary range-sm"
              />
              <div className="w-full flex justify-between text-xs px-2">
                <span>0%</span>
                <span>{formatNumber((selectedShape.opacity || 1) * 100)}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 添加描边配置 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">描边</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="color"
                  value={selectedShape.stroke?.toString() || '#000000'}
                  onChange={(e) => handleEffectChange('stroke', e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  value={formatNumber(selectedShape.strokeWidth || 0, 1)}
                  onChange={(e) =>
                    handleEffectChange('strokeWidth', Number(e.target.value))
                  }
                  className="input input-bordered input-sm"
                  step={STEP_CONFIG.stroke}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            {/* 添加阴影效果 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">阴影</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={!!selectedShape.shadowEnabled}
                    onChange={(e) =>
                      handleEffectChange(
                        'shadowEnabled',
                        e.target.checked ? 1 : 0,
                      )
                    }
                  />
                  <span className="label-text-alt">启用阴影</span>
                </div>
                {selectedShape.shadowEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="color"
                      value={selectedShape.shadowColor || '#000000'}
                      onChange={(e) =>
                        handleEffectChange('shadowColor', e.target.value)
                      }
                      className="w-full h-8 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      value={selectedShape.shadowBlur || 5}
                      onChange={(e) =>
                        handleEffectChange('shadowBlur', Number(e.target.value))
                      }
                      className="input input-bordered input-sm"
                      min="0"
                      max="50"
                    />
                    <input
                      type="number"
                      placeholder="X偏移"
                      value={selectedShape.shadowOffsetX || 0}
                      onChange={(e) =>
                        handleEffectChange(
                          'shadowOffsetX',
                          Number(e.target.value),
                        )
                      }
                      className="input input-bordered input-sm"
                      step={STEP_CONFIG.shadow}
                    />
                    <input
                      type="number"
                      placeholder="Y偏移"
                      value={selectedShape.shadowOffsetY || 0}
                      onChange={(e) =>
                        handleEffectChange(
                          'shadowOffsetY',
                          Number(e.target.value),
                        )
                      }
                      className="input input-bordered input-sm"
                      step={STEP_CONFIG.shadow}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 变换与混合模式 */}
        <div className="collapse collapse-arrow bg-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-medium">高级</div>
          <div className="collapse-content space-y-4">
            {/* 缩放 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">缩放</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">
                    <span className="label-text-alt">X</span>
                  </label>
                  <input
                    type="number"
                    value={formatNumber(selectedShape.scaleX || 1)}
                    onChange={(e) => handleNumberInput(e, 'scaleX')}
                    className="input input-bordered input-sm w-full"
                    step={STEP_CONFIG.scale}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text-alt">Y</span>
                  </label>
                  <input
                    type="number"
                    value={formatNumber(selectedShape.scaleY || 1)}
                    onChange={(e) => handleNumberInput(e, 'scaleY')}
                    className="input input-bordered input-sm w-full"
                    step={STEP_CONFIG.scale}
                  />
                </div>
              </div>
            </div>

            {/* 混合模式 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">混合模式</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={selectedShape.globalCompositeOperation || 'source-over'}
                onChange={(e) =>
                  handleEffectChange('globalCompositeOperation', e.target.value)
                }
              >
                <option value="source-over">正常</option>
                <option value="multiply">正片叠底</option>
                <option value="screen">滤色</option>
                <option value="overlay">叠加</option>
                <option value="darken">变暗</option>
                <option value="lighten">变亮</option>
                <option value="color-dodge">颜色减淡</option>
                <option value="color-burn">颜色加深</option>
                <option value="hard-light">强光</option>
                <option value="soft-light">柔光</option>
                <option value="difference">差值</option>
                <option value="exclusion">排除</option>
              </select>
            </div>

            {/* 剪设置 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">裁剪</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={selectedShape.clipEnabled || false}
                  onChange={(e) =>
                    handleEffectChange('clipEnabled', e.target.checked ? 1 : 0)
                  }
                />
                <span className="label-text-alt">启用裁剪</span>
              </div>
            </div>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-medium">线条样式</div>
          <div className="collapse-content space-y-4">
            {/* 仅对线条类型显示 */}
            {(selectedShape.type === 'freedraw' ||
              selectedShape.type === 'line' ||
              selectedShape.type === 'arrow') && (
              <>
                {/* 线条宽度 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">线条宽度</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={selectedShape.strokeWidth || 2}
                    onChange={(e) =>
                      handleEffectChange('strokeWidth', Number(e.target.value))
                    }
                    className="range range-primary range-sm"
                  />
                  <div className="w-full flex justify-between text-xs px-2">
                    <span>1px</span>
                    <span>{selectedShape.strokeWidth || 2}px</span>
                    <span>20px</span>
                  </div>
                </div>

                {/* 线条颜色 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">线条颜色</span>
                  </label>
                  <input
                    type="color"
                    value={selectedShape.stroke?.toString() || '#000000'}
                    onChange={(e) =>
                      handleEffectChange('stroke', e.target.value)
                    }
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 线条样式 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">线条样式</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={selectedShape.lineCap || 'round'}
                    onChange={(e) =>
                      handleEffectChange('lineCap', e.target.value)
                    }
                  >
                    <option value="butt">平直</option>
                    <option value="round">圆形</option>
                    <option value="square">方形</option>
                  </select>
                </div>

                {/* 连接点样式 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">连接点样式</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={selectedShape.lineJoin || 'round'}
                    onChange={(e) =>
                      handleEffectChange('lineJoin', e.target.value)
                    }
                  >
                    <option value="miter">尖角</option>
                    <option value="round">圆角</option>
                    <option value="bevel">斜角</option>
                  </select>
                </div>

                {/* 仅对箭头显示 */}
                {selectedShape.type === 'arrow' && (
                  <>
                    {/* 箭头大小 */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">箭头大小</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label">
                            <span className="label-text-alt">长度</span>
                          </label>
                          <input
                            type="number"
                            value={selectedShape.pointerLength || 10}
                            onChange={(e) =>
                              handleEffectChange(
                                'pointerLength',
                                Number(e.target.value),
                              )
                            }
                            className="input input-bordered input-sm w-full"
                            min="5"
                            max="50"
                          />
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text-alt">宽度</span>
                          </label>
                          <input
                            type="number"
                            value={selectedShape.pointerWidth || 10}
                            onChange={(e) =>
                              handleEffectChange(
                                'pointerWidth',
                                Number(e.target.value),
                              )
                            }
                            className="input input-bordered input-sm w-full"
                            min="5"
                            max="50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 仅对自由绘制显示 */}
                {selectedShape.type === 'freedraw' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">平滑度</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedShape.tension || 0.5}
                      onChange={(e) =>
                        handleEffectChange('tension', Number(e.target.value))
                      }
                      className="range range-primary range-sm"
                    />
                    <div className="w-full flex justify-between text-xs px-2">
                      <span>0</span>
                      <span>{selectedShape.tension || 0.5}</span>
                      <span>1</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 自由绘制专属配置 */}
        {selectedShape.type === 'freedraw' && (
          <>
            {/* 平滑度 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">平滑度</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedShape.tension || 0.5}
                onChange={(e) =>
                  handleEffectChange('tension', Number(e.target.value))
                }
                className="range range-primary range-sm"
              />
              <div className="w-full flex justify-between text-xs px-2">
                <span>0</span>
                <span>{selectedShape.tension || 0.5}</span>
                <span>1</span>
              </div>
            </div>

            {/* 笔触压感 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">笔触压感</span>
              </label>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={selectedShape.pressureEnabled || false}
                onChange={(e) =>
                  handleEffectChange('pressureEnabled', e.target.checked)
                }
              />
            </div>

            {/* 笔触样式 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">笔触样式</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={selectedShape.brushType || 'normal'}
                onChange={(e) =>
                  handleEffectChange('brushType', e.target.value)
                }
              >
                <option value="normal">普通</option>
                <option value="brush">毛笔</option>
                <option value="marker">马克笔</option>
                <option value="pencil">铅笔</option>
              </select>
            </div>

            {/* 笔触不透明度 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">笔触不透明度</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedShape.strokeOpacity || 1}
                onChange={(e) =>
                  handleEffectChange('strokeOpacity', Number(e.target.value))
                }
                className="range range-primary range-sm"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
