import React from 'react';

export interface StandardFormRowProps {
  title: string;
  first?: boolean;
  last?: boolean;
  block?: boolean;
  grid?: boolean;
  style?: React.CSSProperties;
}

export default class StandardFormRow extends React.Component<StandardFormRowProps, any> {}
