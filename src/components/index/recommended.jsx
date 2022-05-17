import React from 'react';
import dynamic from 'next/dynamic';
import Card from './card';

const SetBanner = dynamic(() => import('../../lib/banners'), {
  ssr: false
});

const Recommended = ({data}) => <div>
  <span style={{ marginLeft: '5%', display: 'block' }}>Te puede interesar</span>
  <div className="banner-container">
    <Card
      ID={data._id}
      title={data.title}
      content={data.description}
      url={data.url}
      thumbnail={data.thumbnail}
      image={data.images ? data.images[0] : undefined}
      comments={data.comments}
      category={data.category}
      size="big"
     />
    <SetBanner/>
  </div>
</div>;

export default Recommended;
