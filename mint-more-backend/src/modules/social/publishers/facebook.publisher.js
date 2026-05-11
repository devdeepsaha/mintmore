const axios  = require('axios');
const logger = require('../../../utils/logger');

const FB_API = 'https://graph.facebook.com/v19.0';

/**
 * Publish a post to a Facebook Page.
 * Supports: text, single image, single video, link posts.
 */
const publishToFacebook = async (account, post, media) => {
  const pageId    = account.page_id;
  const pageToken = account.access_token;

  if (!pageId) {
    throw new Error('No Facebook Page ID found for this account. Please reconnect.');
  }

  try {
    let response;

    if (post.content_type === 'video' && media.length > 0) {
      // ── Video post ──────────────────────────────────────────────────────────
      const videoMedia = media[0];

      // Step 1: Upload video to Facebook
      const uploadRes = await axios.post(
        `https://graph-video.facebook.com/v19.0/${pageId}/videos`,
        null,
        {
          params: {
            file_url:    videoMedia.media_url,
            description: buildFacebookCaption(post),
            access_token: pageToken,
          },
        }
      );

      response = { id: uploadRes.data.id };

    } else if (post.content_type === 'carousel' && media.length > 1) {
      // ── Carousel / multi-image post ─────────────────────────────────────────
      // Step 1: Upload each image as a child
      const childIds = await Promise.all(
        media.map(async (m) => {
          const res = await axios.post(
            `${FB_API}/${pageId}/photos`,
            null,
            {
              params: {
                url:          m.media_url,
                published:    false,
                access_token: pageToken,
              },
            }
          );
          return res.data.id;
        })
      );

      // Step 2: Publish parent post linking all children
      const res = await axios.post(
        `${FB_API}/${pageId}/feed`,
        null,
        {
          params: {
            message:      buildFacebookCaption(post),
            attached_media: childIds.map((id) => JSON.stringify({ media_fbid: id })),
            access_token:   pageToken,
          },
        }
      );
      response = res.data;

    } else if (media.length === 1 && post.content_type === 'image') {
      // ── Single image post ───────────────────────────────────────────────────
      const res = await axios.post(
        `${FB_API}/${pageId}/photos`,
        null,
        {
          params: {
            url:          media[0].media_url,
            caption:      buildFacebookCaption(post),
            access_token: pageToken,
          },
        }
      );
      response = res.data;

    } else {
      // ── Text / link post ────────────────────────────────────────────────────
      const res = await axios.post(
        `${FB_API}/${pageId}/feed`,
        null,
        {
          params: {
            message:      buildFacebookCaption(post),
            access_token: pageToken,
          },
        }
      );
      response = res.data;
    }

    const postId  = response.id || response.post_id;
    const postUrl = `https://www.facebook.com/${postId}`;

    logger.info('Facebook publish success', { postId, pageId });
    return { platform_post_id: postId, platform_post_url: postUrl };

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    logger.error('Facebook publish failed', { error: msg, pageId });
    throw new Error(`Facebook: ${msg}`);
  }
};

/**
 * Pull analytics for a Facebook post.
 */
const getFacebookAnalytics = async (account, platformPostId) => {
  try {
    const res = await axios.get(
      `${FB_API}/${platformPostId}/insights`,
      {
        params: {
          metric:       'post_impressions,post_engaged_users,post_reactions_by_type_total',
          access_token: account.access_token,
        },
      }
    );

    const data   = res.data.data || [];
    const byName = Object.fromEntries(data.map((d) => [d.name, d.values?.[0]?.value || 0]));

    return {
      views_count:    byName['post_impressions'] || 0,
      reach_count:    byName['post_impressions_unique'] || 0,
      likes_count:    Object.values(byName['post_reactions_by_type_total'] || {})
                        .reduce((a, b) => a + b, 0),
      comments_count: 0,
      shares_count:   0,
    };
  } catch (err) {
    logger.warn('Facebook analytics failed', { error: err.message });
    return null;
  }
};

/**
 * Refresh a Facebook long-lived token.
 * FB tokens last 60 days — refresh before expiry.
 */
const refreshFacebookToken = async (account) => {
  const env = require('../../../config/env');
  try {
    const res = await axios.get(`${FB_API}/oauth/access_token`, {
      params: {
        grant_type:        'fb_exchange_token',
        client_id:         env.social.facebook.appId,
        client_secret:     env.social.facebook.appSecret,
        fb_exchange_token: account.access_token,
      },
    });
    return {
      access_token:     res.data.access_token,
      token_expires_at: new Date(Date.now() + (res.data.expires_in || 5184000) * 1000),
    };
  } catch (err) {
    logger.error('Facebook token refresh failed', { error: err.message });
    return null;
  }
};

const buildFacebookCaption = (post) => {
  const parts = [];
  if (post.caption)   parts.push(post.caption);
  if (post.hashtags?.length) parts.push(post.hashtags.join(' '));
  if (post.mentions?.length) parts.push(post.mentions.join(' '));
  return parts.join('\n\n');
};

module.exports = { publishToFacebook, getFacebookAnalytics, refreshFacebookToken };