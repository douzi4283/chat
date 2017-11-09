import React, { Component } from 'react';
import { Popup, Header, Grid, Button, Segment } from 'semantic-ui-react';
import 'rxjs';
import { Subject } from 'rxjs/Subject';


const items = [
  {id: 0, text: '', error: false},
  {id: 1, text: 'The', error: false},
  {id: 2, text: 'yoga', error: false},
  {id: 3, text: 'instructor', error: false},
  {id: 4, text: 'shouts', error: true, recommendations: ['speaks', 'talks', 'smiles'], style: {textColor: 'red', decorationColor: 'red', decoration: 'underline'}},
  {id: 5, text: 'so', error: false},
  {id: 6, text: 'quietly', error: false},
  {id: 7, text: 'that', error: false},
  {id: 8, text: 'we', error: false},
  {id: 9, text: 'cann hardly', error: true, recommendations: ['can hardly hear', 'can hardly find', 'can hardly feel', 'can hardly follow'], style: {textColor: 'red', decorationColor: 'red', decoration: 'underline'}},
  {id: 10, text: 'her', error: false},
];


const modify$ = new Subject;

const handlers = {
  modify: ( {item, index} ) => {
    modify$.next({item, index})
  }
};

const appState$ = modify$
    .scan( (acc, c) => {
      acc.filter(item => item.id === c.item.id).map(item => {
        const holdIt = item.text;
        item.text = item.recommendations[c.index];
        item.style.textColor = 'black';
        item.style.decorationColor = 'green';
      })
      return acc;
    }, items);


const CorrectWord = item => {
  const style = {
    float: 'left',
    padding: 3
  };
  return <Header as='h2' style={style}>{item.text}</Header>
};

const WrongWord = item => {
  const style = {
    float: 'left',
    textDecoration: item.style.decoration,
    textDecorationColor: item.style.decorationColor,
    padding: 3
  };

  const _correctHandler = item => index => e => {
    handlers.modify( {item, index })
  };

  return (
      <Popup hoverable flowing trigger={<Header as='h2' color={item.style.textColor} style={style}>{item.text}</Header>}>
        <Grid centered divided columns={item.recommendations.length}>
          {
            item.recommendations.map((r, index) => {
              return (
                  <Grid.Column textAlign='center' style={{width: 150}}>
                    <Header as='h4' color="green">{r}</Header>
                    <Button primary onClick={_correctHandler(item)(index)}>Choose</Button>
                  </Grid.Column>
              )
            })
          }
        </Grid>
      </Popup>
  )
};

const Sentense = (items) => {
  return items.map(item => {
    return item.error ?
        WrongWord(item)
        :
        CorrectWord(item);
  })
};

class GrammerCheck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: this.props.items
    }
  }

  componentDidMount() {
    appState$.subscribe(val => {
      this.setState({
        items: val
      })
    });
  }

  render() {
    const sentenseHtml = Sentense(this.state.items);
    return <div>{sentenseHtml}</div>
  }
}

export default GrammerCheck;