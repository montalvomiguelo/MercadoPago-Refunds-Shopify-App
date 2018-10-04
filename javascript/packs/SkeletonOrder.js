import React from 'react';

import {
  Layout,
  SkeletonPage,
  Card,
  SkeletonBodyText,
  TextContainer
} from '@shopify/polaris';

function SkeletonOrder(props) {
  return (
    <SkeletonPage>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <SkeletonBodyText />
          </Card>
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
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card>
            <Card.Section>
              <TextContainer>
                <SkeletonBodyText lines={5}/>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

export default SkeletonOrder;
