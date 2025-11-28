import User from '../models/User.js';

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      'name email avatar_url bio theme_preference created_at'
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (e) {
    console.error('Get profile error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function updateProfile(req, res) {
  const { name, avatar_url, bio, theme_preference } = req.body;
  const allowedThemes = ['light', 'dark'];

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name !== undefined ? { name } : {}),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(theme_preference && allowedThemes.includes(theme_preference)
          ? { theme_preference }
          : {}),
      },
      { new: true, runValidators: true }
    ).select('name email avatar_url bio theme_preference created_at');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (e) {
    console.error('Update profile error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}


