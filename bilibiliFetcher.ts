export interface SubtitleItem {
  text: string;
  start: number;
  duration: number;
}

/**
 * 提取 B 站视频 ID (BV号)
 * 支持完整 URL 或纯 ID
 * 
 * @param input 可能是 URL 或纯 ID
 * @returns 提取出的 BV 号，失败则返回 null
 */
export function extractBvid(input: string): string | null {
  // 匹配 BV 开头的 ID (BV + 10位字符)
  // BV 号是大小写敏感的，通常以 BV 开头
  const bvRegex = /BV[a-zA-Z0-9]{10}/;
  const match = input.match(bvRegex);
  if (match) {
    console.log('[BilibiliFetcher] Extracted bvid:', match[0]);
    return match[0];
  }
  console.warn('[BilibiliFetcher] Failed to extract bvid from:', input);
  return null;
}

export interface SubtitleResult {
  title: string;
  subtitles: SubtitleItem[];
  aid?: number;
  cid?: number;
}

/**
 * 从 B 站视频获取字幕的核心逻辑
 */
export async function fetchBilibiliSubtitles(bvid: string): Promise<SubtitleResult> {
  try {
    const cleanBvid = extractBvid(bvid);
    if (!cleanBvid) {
      throw new Error("无效的 Bilibili 链接或 BV 号");
    }

    const viewUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${cleanBvid}`;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Cookie': `SESSDATA=${process.env.BILIBILI_SESSDATA}`,
    };

    const viewRes = await fetch(viewUrl, { headers, cache: 'no-store' });
    const viewData = await viewRes.json();
    
    if (viewData.code !== 0 || !viewData.data) {
      throw new Error(`获取视频信息失败: ${viewData.message || '未知错误'}`);
    }

    const videoTitle = viewData.data.title;
    const { cid, aid } = viewData.data;

    const playerUrl = `https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}&bvid=${cleanBvid}`;
    const playerRes = await fetch(playerUrl, { headers, cache: 'no-store' });
    const playerData = await playerRes.json();

    let subtitles = playerData.data?.subtitle?.subtitles || [];

    // 3.1 尝试多种方式获取字幕列表
    if (subtitles.length === 0) {
      console.log('[BilibiliFetcher] No standard subtitles, checking AI and view data...');
      if (playerData.data?.subtitle?.ai_subtitle) {
        subtitles = playerData.data.subtitle.ai_subtitle;
      } else if (viewData.data?.subtitle?.list && viewData.data.subtitle.list.length > 0) {
        subtitles = viewData.data.subtitle.list;
      }
    }

    // 3.2 如果还是没有，尝试从 viewData.data.subtitle.list 中寻找（有时 player v2 不返回但 view 返回）
    if (subtitles.length === 0 && viewData.data?.subtitle?.list) {
      subtitles = viewData.data.subtitle.list;
    }

    console.log(`[BilibiliFetcher] Found ${subtitles.length} subtitle tracks`);

    if (subtitles.length === 0) {
      console.warn(`[BilibiliFetcher] 视频 ${cleanBvid} 未找到任何字幕轨道`);
      return { title: videoTitle, subtitles: [] };
    }

    // 4. 选择最佳字幕轨道（优先中文，非 AI）
    let bestTrack = subtitles.find((s: any) => s.lan === 'zh-CN' && !s.is_ai) 
                 || subtitles.find((s: any) => s.lan === 'zh-Hans' && !s.is_ai)
                 || subtitles[0];

    let subtitleUrl = bestTrack?.subtitle_url || bestTrack?.url;
    if (!subtitleUrl) return { title: videoTitle, subtitles: [] };

    if (subtitleUrl.startsWith('//')) subtitleUrl = `https:${subtitleUrl}`;

    const subtitleRes = await fetch(subtitleUrl, { headers, cache: 'no-store' });
    const subtitleContent = await subtitleRes.json();

    const formattedSubtitles = (subtitleContent.body || []).map((item: any) => ({
      text: item.content,
      start: item.from,
      duration: Number((item.to - item.from).toFixed(3)),
    }));

    return {
      title: videoTitle,
      subtitles: formattedSubtitles,
      aid,
      cid
    };
  } catch (error: any) {
    console.error('[BilibiliFetcher] Error:', error.message);
    throw error;
  }
}
