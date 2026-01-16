const TransactionDetail = ({params: { id }}: {params: { id: string }}) => {
    return <h1>Transaction: {id}</h1>;
};

export default TransactionDetail;