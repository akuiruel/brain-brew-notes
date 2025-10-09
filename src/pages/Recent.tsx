import Layout from '@/components/Layout';

const Recent = () => {
  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Recent</h1>
        <p className="text-muted-foreground">This page will show your recently accessed cheat sheets.</p>
      </div>
    </Layout>
  );
};

export default Recent;