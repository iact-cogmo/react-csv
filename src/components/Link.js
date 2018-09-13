import React from 'react';
import { buildURI, toCSV } from '../core';
import {
  defaultProps as commonDefaultProps,
  propTypes as commonPropTypes
} from '../metaProps';

/**
 *
 * @example ../../sample-site/csvlink.example.md
 */
class CSVLink extends React.Component {
  static defaultProps = commonDefaultProps;
  static propTypes = commonPropTypes;

  constructor(props) {
    super(props);
    this.buildURI = this.buildURI.bind(this);
  }

  buildURI() {
    return buildURI(...arguments);
  }

  /**
   * In IE11 this method will trigger the file download
   */
  handleLegacy(event, data, headers, separator, filename, uFEFF) {
    console.log('handleLegacy');
    // 以下ie11だった場合のみ処理される
    if (window.navigator.msSaveOrOpenBlob) {
      console.log('download for ie11');
      // Stop the click propagation
      event.preventDefault();

      const csv = toCSV(data, headers, separator);
      let blob = new Blob([uFEFF ? '\uFEFF' : '', csv], {type: 'text/csv'});
      window.navigator.msSaveBlob(blob, filename);

      return false;
    }
  }

  handleAsyncClick(event, ...args) {
    const done = proceed => {
      if (proceed === false) {
        event.preventDefault();
        return;
      }
      this.handleLegacy(event, ...args);
    };

    this.props.onClick(event, done);
  }

  handleSyncClick(event, ...args) {
    const stopEvent = this.props.onClick(event) === false;
    if (stopEvent) {
      event.preventDefault();
      return;
    }
    this.handleLegacy(event, ...args);
  }

  handleClick(...args) {
    console.log('handleclick');
    return event => {
      if (typeof this.props.onClick === 'function') {
        return this.props.asyncOnClick
          ? this.handleAsyncClick(event, ...args)
          : this.handleSyncClick(event, ...args);
      }
      this.handleLegacy(event, ...args);
    };
  }

  render() {
    const {
      data,
      headers,
      separator,
      filename,
      uFEFF,
      children,
      onClick,
      asyncOnClick,
      ...rest
    } = this.props;
    return (
      <a
        download={filename}
        {...rest}
        ref={link => (this.link = link)}
        href={this.buildURI(data, uFEFF, headers, separator)}
        onClick={this.handleClick(data, headers, separator, filename, uFEFF)}
      >
        {children}
      </a>
    );
  }
}

export default CSVLink;
