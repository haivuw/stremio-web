// Copyright (C) 2017-2022 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('@stremio/stremio-icons/dom');
const { Button, Image, PlayIconCircleCentered } = require('stremio/common');
const StreamPlaceholder = require('./StreamPlaceholder');
const styles = require('./styles');

const { useStreamingServer } = require('stremio/common');
var Buffer = require('buffer/').Buffer;

/**
 * @typedef {Object} Meta - Torrent meta.
 * @property {string} infoHash - The torrent hash.
 * @property {number} fileIdx - The file index.
 */

// pipe. stops if arg is falsy
const pipe = (...fns) => (x) => fns.reduce((v, f) => v ? f(v) : v, x);

const sanitizeJsonString = (s) => s.match(/^\{.*\}\}$/)?.[0];

const base64ToString = (s) => Buffer.from(s, 'base64').toString();

// if user on iOS, return href that open in apps (VLC, Infuse, etc)
const useIosLinks = (links, app = 'vlc') => {
    const server = useStreamingServer();

    const isIOS = /iPad|iPhone/.test(navigator.userAgent) && !window.MSStream;
    if (!isIOS) return links.player;

    /**
     * Get the stream URL for the provided meta.
     * @param {Meta} meta - The meta object.
     * @returns {string} The stream URL.
     */
    const getStreamUrl = (meta) =>
        `${app}://${new URL(`${meta.infoHash}/${meta.fileIdx}`, server.selected.transportUrl)}`;

    const streamUrl = pipe(
        decodeURIComponent,
        base64ToString,
        sanitizeJsonString,
        JSON.parse,
        getStreamUrl
    )(links.player);

    return streamUrl;
};

const Stream = ({ className, addonName, name, description, thumbnail, progress, deepLinks, ...props }) => {
    const href = useIosLinks(deepLinks);
    const renderThumbnailFallback = React.useCallback(() => (
        <Icon className={styles['placeholder-icon']} icon={'ic_broken_link'} />
    ), []);
    return (
        <Button href={href} {...props} className={classnames(className, styles['stream-container'])} title={addonName}>
            {
                typeof thumbnail === 'string' && thumbnail.length > 0 ?
                    <div className={styles['thumbnail-container']} title={name || addonName}>
                        <Image
                            className={styles['thumbnail']}
                            src={thumbnail}
                            alt={' '}
                            renderFallback={renderThumbnailFallback}
                        />
                    </div>
                    :
                    <div className={styles['addon-name-container']} title={name || addonName}>
                        <div className={styles['addon-name']}>{name || addonName}</div>
                    </div>
            }
            <div className={styles['info-container']} title={description}>{description}</div>
            <PlayIconCircleCentered className={styles['play-icon']} />
            {
                progress !== null && !isNaN(progress) && progress > 0 ?
                    <div className={styles['progress-bar-container']}>
                        <div className={styles['progress-bar']} style={{ width: `${Math.min(progress, 1) * 100}%` }} />
                    </div>
                    :
                    null
            }
        </Button>
    );
};

Stream.Placeholder = StreamPlaceholder;

Stream.propTypes = {
    className: PropTypes.string,
    addonName: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    progress: PropTypes.number,
    deepLinks: PropTypes.shape({
        player: PropTypes.string
    })
};

module.exports = Stream;
