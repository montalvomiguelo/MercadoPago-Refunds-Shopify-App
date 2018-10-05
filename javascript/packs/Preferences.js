import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Page,
  Layout,
  Card,
  TextField,
  FormLayout,
  SkeletonPage,
  SkeletonBodyText,
  TextContainer
} from '@shopify/polaris';

import CredentialsInfo from './CredentialsInfo';

import axios from 'axios';

class Preferences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: '',
      clientSecret: ''
    }
  }

  static contextTypes = {
    easdk: PropTypes.object,
  };

  handleInputchange(field) {
    return (value) => this.setState({[field]: value});
  }

  submitCredentials() {
    axios.put('/shop', {
      client_id: this.state.clientId,
      client_secret: this.state.clientSecret
    })
      .then(response => {
        const data = response.data;

        this.setState({
          clientId: data.mp_client_id || '',
          clientSecret: data.encrypted_mp_client_secret || '',
        });

        this.context.easdk.showFlashNotice('Preferences saved');
      });
  }

  componentDidMount() {
    axios.get('/shop')
      .then(response => {
        const data = response.data;
        this.setState({
          clientId: data.mp_client_id || '',
          clientSecret: data.mp_secret || '',
        });
      });
  }

  render() {
    const loadingStateContent = !this.state.clientId ? (
      <SkeletonPage>
        <Layout>
          <Layout.AnnotatedSection
            description={<SkeletonBodyText />}
          >
            <Card sectioned>
              <TextContainer>
                <SkeletonBodyText />
              </TextContainer>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </SkeletonPage>
    ): null;

    const content = this.state.clientId ? (
      <Layout>
        <Layout.AnnotatedSection
          title="Configure your credentials"
          description={<CredentialsInfo />}
        >
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Client id"
                value={this.state.clientId}
                onChange={this.handleInputchange('clientId')}
              />
              <TextField
                type="text"
                label="Client secret"
                value={this.state.clientSecret}
                onChange={this.handleInputchange('clientSecret')}
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    ) : null;

    return (
      <Page
        title="Preferences"
        primaryAction={{
          content: 'Save',
          onAction: this.submitCredentials.bind(this),
          disabled: !this.state.clientId || !this.state.clientSecret
        }}
      >
        {loadingStateContent}
        {content}
      </Page>
    );
  }
}

export default Preferences;
