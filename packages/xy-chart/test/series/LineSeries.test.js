import { GlyphDot } from '@vx/glyph';
import { LinePath } from '@vx/shape';
import React from 'react';
import { shallow } from 'enzyme';
import { FocusBlurHandler } from '@data-ui/shared';

import { XYChart, LineSeries } from '../../src';

describe('<LineSeries />', () => {
  const mockProps = {
    xScale: { type: 'time' },
    yScale: { type: 'linear', includeZero: false },
    width: 100,
    height: 100,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    ariaLabel: 'label',
  };

  const mockData = [
    { date: new Date('2017-01-05'), cat: 'a', num: 15 },
    { date: new Date('2018-01-05'), cat: 'b', num: 51 },
    { date: new Date('2019-01-05'), cat: 'c', num: 377 },
  ];

  it('should be defined', () => {
    expect(LineSeries).toBeDefined();
  });

  it('should not render without x- and y-scales', () => {
    expect(shallow(<LineSeries data={[]} />).type()).toBeNull();
  });

  it('should render a LinePath for each LineSeries', () => {
    const wrapper = shallow(
      <XYChart {...mockProps}>
        <LineSeries data={mockData.map(d => ({ ...d, x: d.date, y: d.num }))} />
        <LineSeries data={mockData.map(d => ({ ...d, x: d.date, y: d.num }))} />
      </XYChart>,
    );
    expect(wrapper.find(LineSeries)).toHaveLength(2);
    expect(
      wrapper
        .find(LineSeries)
        .first()
        .dive()
        .find(LinePath),
    ).toHaveLength(1);
  });

  it('should render points depending on props', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const wrapperWithPoints = shallow(
      <XYChart {...mockProps}>
        <LineSeries data={data} showPoints />
      </XYChart>,
    );
    const lineSeriesWithPoints = wrapperWithPoints.find(LineSeries).dive();
    const linePathWithPoints = lineSeriesWithPoints.find(LinePath).dive();
    expect(linePathWithPoints.find(GlyphDot)).toHaveLength(data.length);

    const wrapperNoPoints = shallow(
      <XYChart {...mockProps}>
        <LineSeries data={data} showPoints={false} />
      </XYChart>,
    );
    const lineSeriesNoPoints = wrapperNoPoints.find(LineSeries).dive();
    const linePathNoPoints = lineSeriesNoPoints.find(LinePath).dive();
    expect(linePathNoPoints.find(GlyphDot)).toHaveLength(0);
  });

  it('should not render points for null data', () => {
    const wrapper = shallow(
      <XYChart {...mockProps}>
        <LineSeries
          data={mockData.map((d, i) => ({
            // test null x AND y's
            x: i === 0 ? null : d.date,
            y: i === 1 ? null : d.num,
          }))}
          showPoints
        />
      </XYChart>,
    );
    const series = wrapper.find(LineSeries).dive();
    const path = series.find(LinePath).dive();
    expect(path.find(GlyphDot)).toHaveLength(mockData.length - 2);
  });

  it('should call onMouseMove({ datum, data, event, color }), onMouseLeave(), and onClick({ datum, data, event, color }) on trigger', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const onMouseMove = jest.fn();
    const onMouseLeave = jest.fn();
    const onClick = jest.fn();

    const wrapper = shallow(
      <XYChart
        {...mockProps}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <LineSeries data={data} stroke="gray-or-grey?" />
      </XYChart>,
    );

    const line = wrapper
      .find(LineSeries)
      .dive()
      .find(LinePath)
      .dive()
      .find('path');

    line.simulate('mousemove', { event: {} });
    expect(onMouseMove).toHaveBeenCalledTimes(1);
    let args = onMouseMove.mock.calls[0][0];
    expect(args.data).toBe(data);
    expect(args.datum).toBeNull(); // @TODO depends on mocking out findClosestDatum
    expect(args.event).toBeDefined();
    expect(args.color).toBe('gray-or-grey?');

    line.simulate('mouseleave');
    expect(onMouseLeave).toHaveBeenCalledTimes(1);

    line.simulate('click', { event: {} });
    expect(onMouseMove).toHaveBeenCalledTimes(1);
    args = onMouseMove.mock.calls[0][0]; // eslint-disable-line prefer-destructuring
    expect(args.data).toBe(data);
    expect(args.datum).toBeNull(); // @TODO depends on mocking out findClosestDatum
    expect(args.event).toBeDefined();
    expect(args.color).toBe('gray-or-grey?');
  });

  it('should not trigger onMouseMove, onMouseLeave, or onClick if disableMouseEvents is true', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const onMouseMove = jest.fn();
    const onMouseLeave = jest.fn();
    const onClick = jest.fn();

    const wrapper = shallow(
      <XYChart
        {...mockProps}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <LineSeries data={data} disableMouseEvents />
      </XYChart>,
    );

    const line = wrapper
      .find(LineSeries)
      .dive()
      .find(LinePath)
      .dive()
      .find('path');

    line.simulate('mousemove');
    expect(onMouseMove).toHaveBeenCalledTimes(0);

    line.simulate('mouseleave');
    expect(onMouseLeave).toHaveBeenCalledTimes(0);

    line.simulate('click');
    expect(onMouseMove).toHaveBeenCalledTimes(0);
  });

  it('should render a FocusBlurHandler for each point', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const wrapper = shallow(
      <XYChart {...mockProps}>
        <LineSeries data={data} />
      </XYChart>,
    );

    const line = wrapper
      .find(LineSeries)
      .dive()
      .find(LinePath)
      .dive();

    expect(line.find(FocusBlurHandler)).toHaveLength(data.length);
  });

  it('should invoke onMouseMove when focused', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const onMouseMove = jest.fn();

    const wrapper = shallow(
      <XYChart {...mockProps} onMouseMove={onMouseMove}>
        <LineSeries data={data} />
      </XYChart>,
    );

    const firstPoint = wrapper
      .find(LineSeries)
      .dive()
      .find(LinePath)
      .dive()
      .find(FocusBlurHandler)
      .first();

    firstPoint.simulate('focus');
    expect(onMouseMove).toHaveBeenCalledTimes(1);
  });

  it('should invoke onMouseLeave when blured', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const onMouseLeave = jest.fn();

    const wrapper = shallow(
      <XYChart {...mockProps} onMouseLeave={onMouseLeave}>
        <LineSeries data={data} />
      </XYChart>,
    );

    const firstPoint = wrapper
      .find(LineSeries)
      .dive()
      .find(LinePath)
      .dive()
      .find(FocusBlurHandler)
      .first();

    firstPoint.simulate('blur');
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });
});
