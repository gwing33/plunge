import _ from 'lodash';
import React, {PropTypes} from 'react';

// TEMPORARY
export function connectStream (streamObj, options = {}) {
    const {
        excludeProps = [],
        includeProps = false
    } = options;

    return (WrappedComponent) => {
        const propTypes = includeProps ? includeProps : (WrappedComponent.propTypes || {});
        const changedProps = _.chain(propTypes)
            .map((prop, key) => key)
            .filter((key) => excludeProps.indexOf(key) === -1)
            .value();

        return React.createClass({
            propTypes: {
                changedProps: PropTypes.array
            },
            getDefaultProps () {
                return {changedProps};
            },
            getInitialState () {
                return {};
            },
            componentWillMount () {
                this.streamFn(this.props);
            },
            componentWillReceiveProps (nextProps) {
                const {props} = this;
                const {changedProps} = props;

                if (changedProps.length > 0) {
                    const diffProps = _.reduce(nextProps, (result, value, key) => {
                        // If key is in changedProps and next value does not equal current value, it's different.
                        const isDiff = changedProps.indexOf(key) > -1 && !_.isEqual(value, props[key]);

                        return isDiff ? result.concat(key) : result;
                    }, []);

                    if (diffProps.length > 0) {
                        this.streamFn(nextProps);
                    }
                }
            },
            componentWillUnmount () {
                this.disposeStream();
            },
            streamFn (props) {
                this.disposeStream();

                _.forEach(streamObj, (val, key) => {
                    this.subscribe[key] = val(props).subscribe(
                        (msg) => {
                            if (msg !== null) {
                                this.setState(
                                    _.extend(
                                        {},
                                        {[key]: {isError: false}},
                                        {[key]: msg}
                                    )
                                );
                            }
                        },
                        (err) => {
                            this.setState({[key]: {isError: true, err}});
                        }
                    );
                });
            },
            disposeStream () {
                if (!this.subscribe) {
                    this.subscribe = {};
                }

                _.forEach(streamObj, (val, key) => {
                    if (this.subscribe[key] && this.subscribe[key].dispose) {
                        this.subscribe[key].dispose();
                    }
                });
            },
            render () {
                return <WrappedComponent {..._.extend({}, this.props, this.state, )} />;
            }
        });
    };
}
