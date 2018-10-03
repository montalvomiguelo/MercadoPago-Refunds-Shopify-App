import React from 'react';

import {
  Layout,
  SkeletonPage,
  SkeletonBodyText,
  TextContainer,
  Card,
} from '@shopify/polaris';

function SkeletonHome(props) {
  return (
    <SkeletonPage>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <SkeletonBodyText />
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={1} />
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

export default SkeletonHome;
