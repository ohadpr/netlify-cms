import React, { PropTypes } from 'react';
import MarkupIt, { Syntax, BLOCKS, STYLES, ENTITIES } from 'markup-it';

const defaultRenderers = {
  [BLOCKS.DOCUMENT]: 'article',
  [BLOCKS.TEXT]: null,
  [BLOCKS.CODE]: 'code',
  [BLOCKS.BLOCKQUOTE]: 'blockquote',
  [BLOCKS.PARAGRAPH]: 'p',
  [BLOCKS.FOOTNOTE]: 'footnote',
  [BLOCKS.HTML]: (props) => null,
  [BLOCKS.HR]: 'hr',
  [BLOCKS.HEADING_1]: 'h1',
  [BLOCKS.HEADING_2]: 'h2',
  [BLOCKS.HEADING_3]: 'h3',
  [BLOCKS.HEADING_4]: 'h4',
  [BLOCKS.HEADING_5]: 'h5',
  [BLOCKS.HEADING_6]: 'h6',
  [BLOCKS.TABLE]: 'table',
  [BLOCKS.TABLE_ROW]: 'tr',
  [BLOCKS.TABLE_CELL]: 'td',
  [BLOCKS.OL_LIST]: 'ol',
  [BLOCKS.UL_LIST]: 'ul',
  [BLOCKS.LIST_ITEM]: 'li',

  [STYLES.TEXT]: null,
  [STYLES.BOLD]: 'strong',
  [STYLES.ITALIC]: 'em',
  [STYLES.CODE]: 'code',
  [STYLES.STRIKETHROUGH]: 'del',

  [ENTITIES.LINK]: 'a',
  [ENTITIES.IMAGE]: 'img',
  [ENTITIES.FOOTNOTE_REF]: 'sup',
  [ENTITIES.HARD_BREAK]: 'br'
};

function renderToken(token, index = 0, key = '0') {
  const type = token.get('type');
  const data = token.get('data');
  const text = token.get('text');
  const tokens = token.get('tokens');
  const nodeType = defaultRenderers[type];
  key = `${key}.${index}`;

  // Only render if type is registered as renderer
  if (typeof nodeType !== 'undefined') {
    let children = null;
    if (tokens.size) {
      children = tokens.map((token, idx) => renderToken(token, idx, key));
    } else if (type === 'text') {
      children = text;
    }
    if (nodeType !== null) {
      // If this is a react element
      return React.createElement(
        nodeType,
        { key, ...data.toJS() }, // Add key as a prop
        children
      );
    } else {
      // If this is a text node
      return children;
    }
  }
  return null;
}

export default class MarkitupReactRenderer extends React.Component {

  constructor(props) {
    super(props);
    const { syntax } = props;
    this.parser = new MarkupIt(syntax);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.syntax != this.props.syntax) {
      this.parser = new MarkupIt(nextProps.syntax);
    }
  }

  render() {
    const { value } = this.props;
    const content = this.parser.toContent(value);
    return renderToken(content.get('token'));
  }
}

MarkitupReactRenderer.propTypes = {
  value: PropTypes.string,
  syntax: PropTypes.instanceOf(Syntax).isRequired
};