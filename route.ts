import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchBilibiliSubtitles } from '@/utils/bilibiliFetcher';

// 1. 修改 Client 初始化：切换至 DeepSeek 终结点
// 注意：请在 .env.local 中添加 DEEPSEEK_API_KEY 变量
const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { bvid } = await req.json();
        console.log('[AnalyzeSteps] Received bvid:', bvid);

        if (!bvid) {
            return NextResponse.json({ error: 'Missing bvid' }, { status: 400 });
        }

        // 1. 获取全量字幕数组和视频信息
        const subtitlesData = await fetchBilibiliSubtitles(bvid);
        const { title: videoTitle, subtitles } = subtitlesData;
        
        if (!subtitles || subtitles.length === 0) {
            console.error(`[AnalyzeSteps] No subtitles found for bvid: ${bvid}`);
            return NextResponse.json({ error: '该视频没有找到字幕，AI 无法分析。' }, { status: 404 });
        }

        console.log(`[AnalyzeSteps] Fetched ${subtitles.length} subtitles for: ${videoTitle}`);
        
        // 2. 转换为带时间戳的文本格式作为 Context
        const formattedSubtitles = subtitles
            .map((s) => {
                const minutes = Math.floor(s.start / 60);
                const seconds = Math.floor(s.start % 60);
                const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
                return `${timestamp} ${s.text}`;
            })
            .join('\n');
        
        // 打印前 300 个字符进行调试
        console.log('[AnalyzeSteps] Subtitles Preview:', formattedSubtitles.substring(0, 300));

        // 3. 调用 DeepSeek 进行拆解
        const systemPrompt = `
你是一个专业的视频内容拆解助手。
你的任务是分析提供的视频字幕，并将其拆解为 5-10 个教学步骤。

### 核心规则（违反将导致任务失败）：
1. **绝对禁止虚构**：你必须且只能根据提供的字幕内容来生成步骤。如果字幕中没有提到某个动作，绝对不要出现在结果中。
2. **识别真实意图**：通过字幕判断视频是健身教学、烹饪教程还是知识分享。
3. **时间戳对齐**：startTime 和 endTime 必须严格对应字幕中的时间点。

### 输出格式：
必须返回纯 JSON，结构如下：
{
  "title": "${videoTitle}",
  "category": "健身/烹饪/知识/其他",
  "steps": [
    {
      "id": 1,
      "title": "步骤简短标题",
      "description": "基于字幕的详细描述",
      "startTime": 数字(秒),
      "endTime": 数字(秒),
      "difficulty": "easy/medium/hard",
      "calories": 估算的卡路里消耗(仅健身类，否则为0)
    }
  ]
}
`;

        const userPrompt = `视频标题：${videoTitle}\n\n以下是视频的完整字幕内容，请严格基于此内容拆解步骤：\n\n${formattedSubtitles}`;

        console.log('[AnalyzeSteps] Calling DeepSeek...');
        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
        });

        let content = response.choices[0].message.content || '{}';
        console.log('[AnalyzeSteps] Raw response from DeepSeek:', content);
        
        // 更鲁棒的 JSON 提取逻辑
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        try {
            const result = JSON.parse(content.trim());
            // 将 aid 和 cid 注入到返回结果中，方便前端播放器使用
            return NextResponse.json({
                ...result,
                aid: subtitlesData.aid,
                cid: subtitlesData.cid
            });
        } catch (parseError) {
            console.error('[AnalyzeSteps] JSON Parse Error:', parseError);
            console.error('[AnalyzeSteps] Failed content:', content);
            return NextResponse.json({ 
                error: 'Failed to parse AI response',
                rawContent: content 
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Analyze steps error (DeepSeek):', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}