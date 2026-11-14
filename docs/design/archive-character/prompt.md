# 归档页角色底图

生成方式：内置 image_gen；透明背景 PNG，1024 × 1536。

提示词：以现有阅读角色为身份和画风参考，保留薄荷绿长发、光环、青绿色蝴蝶结、蓝色水手服、淡黄色领结、奶油色裙子与腿套、青绿色鞋子。角色坐在三本鼠尾草绿、奶油色、灰青色的旧手账上，双手把一本带书签的合上笔记抱在胸前，双腿自然垂下，神情安静，眼睛睁开。完整展示光环、鞋子与手账，采用简洁柔和的平涂插画，透明背景，无文字、标志或其他角色。作为后续呼吸、眨眼动画的静态底图。

已从睁眼、闭眼底图合成 384 × 576 的透明动画，160 帧、每帧 50ms、8 秒无限循环。身体轻微呼吸，手账堆固定，循环内自然眨眼两次。

页面使用 `public/assets/character-archive-breathing-blink.webp`；减少动态效果时使用 `public/assets/character-archive-still.png`。GIF 预览保存在本目录。

重建：安装 Python、Pillow、NumPy 和 `gpt-anime-denoise` skill，运行 `python docs/design/archive-character/animate.py`。闭眼帧由内置 image_gen 生成，仅改变眼睑，合成时只取眼部局部，保留底图其余区域。
