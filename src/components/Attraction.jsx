import React from 'react';
import axios from 'axios';
import Header from './Header';
import Overview from './Overview';
import Tickets from './Tickets';
import Images from './Images';
import css from '../styles/attraction.module.css';

export default class Attraction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: null,
      pics: [],
      likeHover: false,
      form: {
        description: '',
        isOpen: false,
        suggestedDuration: 0,
        address: '',
      },
      clickImproved: false,
    };
    this.updateHeartHover = this.updateHeartHover.bind(this);
    this.updateLikeStatus = this.updateLikeStatus.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.submitImprovements = this.submitImprovements.bind(this);
    this.openCloseForm = this.openCloseForm.bind(this);
  }

  componentDidMount() {
    axios.get('http://3.134.108.121:3001/api/showcase')
      .then((result) => {
        const attractions = result.data[0];
        const pictures = result.data[1];
        // console.log(attractions);
        this.setState({
          current: attractions[1],
          pics: pictures,
        });
      })
      .catch((err) => console.log('error GETTING all', err));
  }

  handleFormChange(e) {
    const { form } = this.state;
    // must copy new value, cannot modify e.target.value directly
    let newValue = e.target.value;
    if (e.target.name === 'suggestedDuration') {
      newValue = Number(newValue);
    }
    if (newValue === 'true') {
      newValue = true;
    }
    if (newValue === 'false') {
      newValue = false;
    }
    this.setState({
      form: {
        ...form,
        [e.target.name]: newValue,
      },
    });
  }

  openCloseForm() {
    const { clickImproved, form, current } = this.state;
    const {
      description, address, isOpen, suggestedDuration,
    } = current;

    this.setState({
      clickImproved: !clickImproved,
      form: {
        ...form,
        description,
        address,
        isOpen,
        suggestedDuration,
      },
    });
  }

  submitImprovements(id, e) {
    e.preventDefault();
    const { form, current } = this.state;
    console.log(form);
    const currentForm = {
      description: current.description,
      isopen: current.isOpen,
      suggestedduration: current.suggestedDuration,
      address: current.address,
    };
    if (JSON.stringify(form) === JSON.stringify(currentForm)) {
      console.log('Must Submit Improvements to Current Attraction Listing');
    } else {
      console.log('this is the axios post id --', id);
      axios.post(`http://3.134.108.121:3001/api/showcase/${id}`, form)
        .then(({ data }) => {
          this.openCloseForm();
          console.log(data.message);
        })
        .catch((err) => console.log('error', err));
    }
  }

  updateHeartHover() {
    const { likeHover } = this.state;
    this.setState({
      likeHover: !likeHover,
    });
  }

  updateLikeStatus(id) {
    const { current } = this.state;
    this.setState({
      current: {
        ...current,
        likedStatus: !current.likedStatus,
      },
    }, () => {
      axios.patch(`http://3.134.108.121:api/showcase/like/${id}`, { likedStatus: !current.likedStatus })
        .catch((err) => {
          console.log('Error PATCH likedStatus ', err);
        });
    });
  }

  render() {
    const {
      current, likeHover, form, clickImproved, pics,
    } = this.state;
    return (
      // <div>
      //   Hello
      // </div>
      <>
        {current ? (
          <div className={css.attraction}>
            <Header
              current={current}
              updateHeartHover={this.updateHeartHover}
              updateLikeStatus={this.updateLikeStatus}
              likeHover={likeHover}
            />
            <Overview
              overview={current}
              form={form}
              clicked={clickImproved}
              openCloseForm={this.openCloseForm}
              handleFormChange={this.handleFormChange}
              submitImprovements={this.submitImprovements}
              id={current.showcase_id} /* eslint-disable-line no-underscore-dangle */
            />
            <Tickets current={current} />
            <Images images={pics} travelersChoice={current.travelersChoiceAward} />
          </div>
        ) : <div className={css.loading}>Loading...</div>}
      </>
    );
  }
}
