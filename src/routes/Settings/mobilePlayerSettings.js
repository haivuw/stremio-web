const { create } = require('zustand');

const storeKey = 'mobilePlayerSettings';

const useMobilePlayerSettingsStore = create((set) => ({
    player: localStorage.getItem(storeKey) || 'vlc',
    setPlayer: (player) => {
        localStorage.setItem(storeKey, player);
        set({ player });
    },

}));

module.exports = useMobilePlayerSettingsStore;
