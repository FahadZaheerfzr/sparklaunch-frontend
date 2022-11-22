import React, { useState, useEffect } from "react"
import moment from "moment/moment"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)
import { Button, Col, ProgressBar, Row, Form } from "react-bootstrap"
import { NotificationManager } from "react-notifications"

import { useEtherBalance, useEthers } from "@usedapp/core"
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers/lib/utils"
import { BigNumber, BigNumber as BN } from "ethers"
import {
  FACTORY_ADDRESS,
  API_URL,
  ROUTER_ADDRESS,
  ADMIN_ADDRESS,
} from "constants/Address"
import { Contract } from "@ethersproject/contracts"

import SaleAbi from "constants/abi/Sale.json"
import { getUserParticipation } from "utils/factoryHelper"
import { useSelector } from "react-redux"
import { BIG_ONE } from "utils/numbers"
const DEFAULT_DATE_FORMAT = "MMM DD, h:mm A"
const BuyDetailCard = ({ saleData, tokenInfo, saleInfo, roundInfo }) => {
  const currentDate = dayjs.utc().unix()
  const { account, chainId, activateBrowserWallet, library } = useEthers()
  const { selectedChain } = useSelector(state => state.User)
  const [buyVal, setBuyVal] = useState(0)
  const [canBuy, setCanBuy] = useState(false)
  const [participate, setParticipate] = useState()

  const minBuy = Number(formatEther(saleInfo.min))
  const maxBuy = Number(formatEther(saleInfo.max))
  const isPublic = saleInfo.isPublic

  const saleStart = BN.from(saleInfo.saleStart).toNumber()
  const saleEnd = BN.from(saleInfo.saleEnd).toNumber()

  const userBalance = useEtherBalance(account)

  useEffect(async () => {
    if (!account) {
      return
    }
    try {
      const userParticipate = await getUserParticipation(
        selectedChain,
        saleData.address,
        account
      )
      userParticipate.success ? setParticipate(userParticipate.data) : ""
      return
    } catch (error) {}
  }, [account, selectedChain])

  let saleStatus = ""
  if (saleStart > currentDate) {
    saleStatus = "Not Started"
  } else if (saleStart < currentDate && saleEnd > currentDate) {
    saleStatus = "In Progress"
  } else if (saleEnd < currentDate) {
    saleStatus = "Finished"
  }

  const validBuyVal = val => {
    return val >= minBuy && val <= maxBuy
  }

  const handleChangeValue = val => {
    let newVal = buyVal
    if (val > maxBuy) {
      return
    } else {
      newVal = val
    }
    setBuyVal(newVal)
  }

  const handleBuyButton = async () => {
    if (participate.token !== "0") {
      console.log(userBalance)
      NotificationManager.error("Already Participated !", "Error")
      return
    }
    if (parseEther(buyVal.toString()).gt(userBalance)) {
      NotificationManager.error("You dont have enough money !", "Error")
      return
    }

    if (validBuyVal(buyVal)) {
      const saleContractAddress = saleData.address
      const contract = new Contract(
        saleContractAddress,
        SaleAbi,
        library.getSigner()
      )
      const amountBuy = parseEther(buyVal.toString()).toString()
      try {
        const estimation = await contract.estimateGas.participate("0", {
          value: amountBuy,
        })
        console.log(estimation)
      } catch (error) {
        console.log(error.message)
        return
      }

      try {
        const tx = await contract.participate("0", {
          value: amountBuy,
        })
        await tx.wait()
      } catch (error) {
        console.log(error)
      }
    } else {
      NotificationManager.error("Buy Value Not Valid", "Error")
    }
  }

  useEffect(() => {
    if (account && saleStatus == "In Progress") {
      setCanBuy(true)
      return
    }
    setCanBuy(false)
  }, [account, saleStatus])

  return (
    <div className="buy-detail-card" id="buy-card">
      <div className="my-2">
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Amount In BNB (max {maxBuy})</Form.Label>
          <Form.Control
            defaultValue={buyVal}
            value={buyVal}
            type="number"
            placeholder="0"
            // step=".0000001"
            // min={minBuy}
            max={maxBuy}
            // onKeyUp={e => handleChangeValue(Number(e.target.value))}
            onChange={e => handleChangeValue(Number(e.target.value))}
          />
        </Form.Group>
      </div>
      <div className="my-2">
        {canBuy ? (
          <Button
            className="btn buy-or-connect"
            href="#"
            id="links"
            onClick={() => handleBuyButton()}
          >
            BUY
          </Button>
        ) : (
          <Button
            className="btn buy-or-connect"
            href="#"
            id="links"
            onClick={!account ? () => activateBrowserWallet() : () => {}}
          >
            {account ? " SALE IS NOT STARTED / FINISHED" : "CONNECT WALLET"}
          </Button>
        )}
      </div>
      <div className="text-white font-size-11">
        <div className="d-flex w-100 flex-wrap mb-0 py-1 border-bottom border-white border-opacity-50"></div>
        <div className="text-white font-size-11">
          <div className="d-flex w-100 flex-wrap justify-content-between mb-0 py-1 border-bottom border-white border-opacity-50">
            <div className="fw-bold">Your Participation</div>
            {participate && (
              <div className="text-white">
                {formatUnits(participate.token, tokenInfo.decimals)}{" "}
                {tokenInfo.symbol} / {formatUnits(participate.native, 18)} BNB
              </div>
            )}
          </div>
        </div>
        <div className="d-flex w-100 flex-wrap justify-content-between mb-0 py-1 border-bottom border-white border-opacity-50">
          <div className="w-25 fw-bold">Status</div>
          <div className="text-white">{saleStatus}</div>
        </div>
        <div className="d-flex w-100 flex-wrap justify-content-between mb-0 py-1 border-bottom border-white border-opacity-50">
          <div className="w-25 fw-bold">Sale type</div>
          <div className="text-white">
            {isPublic ? "Public Sale" : "Private Whitelist"}
          </div>
        </div>
        <div className="d-flex w-100 flex-wrap justify-content-between mb-0 py-1 border-bottom border-white border-opacity-50">
          <div className="w-25 fw-bold">Min Buy</div>
          <div className="text-white">{minBuy} BNB</div>
        </div>
        <div className="d-flex w-100 flex-wrap justify-content-between mb-0 py-1 border-bottom border-white border-opacity-50">
          <div className="w-25 fw-bold">Max Buy</div>
          <div className="text-white">{maxBuy} BNB</div>
        </div>
      </div>
    </div>
  )
}

export default BuyDetailCard
