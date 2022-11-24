import React from "react"
import { formatBigNumber } from "utils/numbers"

const TokenInfo = ({ info }) => {
  return (
    <div className="text-white font-size-14 mb-4">
      <h5 className="text-primary">Token Info</h5>
      <div className="d-flex w-100 flex-wrap mb-0 py-1">
        <div className="w-25 fw-bold">Name</div>
        <div className="text-primary">: {info.name}</div>
      </div>
      <div className="d-flex w-100 flex-wrap mb-0 py-1">
        <div className="w-25 fw-bold">Symbols</div>
        <div className="text-primary">: {info.symbol}</div>
      </div>
      <div className="d-flex w-100 flex-wrap mb-0 py-1">
        <div className="w-25 fw-bold">Decimals</div>
        <div className="text-primary">: {info.decimals}</div>
      </div>
      <div className="d-flex w-100 flex-wrap mb-0 py-1">
        <div className="w-25 fw-bold">Supply</div>
        <div className="text-primary">
          : {formatBigNumber(info.totalSupply, info.decimals)}
        </div>
      </div>
      <div className="d-flex w-100 flex-wrap mb-0 py-1">
        <div className="w-25 fw-bold">Type</div>
        <div className="text-primary">: BEP20 / ERC20</div>
      </div>
    </div>
  )
}

export default TokenInfo