import React, { useState, useEffect } from "react"
import moment from "moment/moment"

import { Button, Col, ProgressBar, Row, Form, Modal } from "react-bootstrap"

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
  CHAIN_NUMBER,
} from "constants/Address"
import { Contract } from "@ethersproject/contracts"
import { NotificationManager } from "react-notifications"

import SaleAbi from "constants/abi/Sale.json"

import useIsAdmin from "hooks/useIsAdmin"
const DEFAULT_DATE_FORMAT = "MMM DD, h:mm A"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

const OwnerCard = ({ saleData, tokenInfo, saleInfo, roundInfo }) => {
  const currentDate = dayjs.utc().unix()
  const { account, library } = useEthers()
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaleOwner, setIsSaleOwner] = useState(false)
  const [isAlreadyEnd, setIsAlreadyEnd] = useState(false)

  const isUserAdmin = useIsAdmin(account)

  const handleConfirm = async e => {
    setIsProcessing(true)

    const saleContractAddress = saleData.address
    const contract = new Contract(
      saleContractAddress,
      SaleAbi,
      library.getSigner()
    )

    try {
      const tx = await contract.finishSale()
      await tx.wait()
      NotificationManager.success(
        `${finalize ? "Finalize " : "Cancel "} Sale is Success  `,
        "Thanks"
      )
    } catch (error) {
      NotificationManager.error(
        `${finalize ? "Finalize " : "Cancel "} Sale is Fail`,
        "Sorry"
      )
    }

    setTimeout(() => {
      setIsProcessing(false)
      setShowModal(false)
    }, 2000)
  }

  useEffect(() => {
    if (saleInfo.isFinished) {
      setIsAlreadyEnd(true)
    }
    if (account == saleInfo.saleOwner) {
      setIsSaleOwner(true)
    } else {
      setIsSaleOwner(false)
    }
  }, [account, saleInfo])

  const isSaleTimeEnd = roundInfo.end < currentDate
  const finalize = BigNumber.from(saleInfo.softCapBNB).lte(
    BigNumber.from(saleInfo.raisedBNB)
  )

  return (
    <>
      {isAlreadyEnd || !isSaleTimeEnd ? (
        <></>
      ) : isUserAdmin || isSaleOwner ? (
        <div className="buy-detail-card" id="buy-card">
          <div className="d-flex w-100 flex-wrap mb-0 py-1 border-white border-opacity-50 justify-content-center">
            <div className="fs-5 fw-bold mb-2">SALE OWNER ADMINISTRATION</div>
            <Button
              className="btn buy-or-connect mb-2"
              onClick={() => {
                setShowModal(true)
              }}
            >
              {finalize ? "FINALIZE SALE" : "CANCEL SALE"}
            </Button>
          </div>
        </div>
      ) : (
        <></>
      )}

      <Modal
        backdrop="static"
        size="sm"
        show={showModal}
        centered
        onHide={() => setShowModal(false)}
      >
        <div className="modal-content">
          <Modal.Header>
            <span className="text-primary fs-4">Confirmation</span>
          </Modal.Header>
          <div className="p-4">
            <div className="text-center">
              <div className="mb-3 fs-4">
                Are you sure want to {finalize ? "Finalize " : "Cancel "} this
                sale ?
              </div>
              <button
                className="btn btn-primary px-3 fw-bolder w-100 text-nowrap mb-3"
                disabled={isProcessing}
                onClick={e => handleConfirm(e)}
              >
                YES {finalize ? " FINALIZE SALE" : " CANCEL SALE"}
              </button>
              <button
                className="btn btn-primary px-3 fw-bolder w-100 text-nowrap"
                disabled={isProcessing}
                onClick={e => setShowModal(false)}
              >
                NO
              </button>
            </div>
          </div>
          <Modal.Body></Modal.Body>
        </div>
      </Modal>
    </>
  )
}

export default OwnerCard
